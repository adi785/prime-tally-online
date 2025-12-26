import { supabase } from './client';
import { 
  Ledger, 
  Voucher, 
  DashboardMetrics, 
  StockItem, 
  Company,
  VoucherType,
  LedgerGroup
} from '@/types/tally';

// Service functions for direct Supabase operations

export const ledgerService = {
  async getLedgers() {
    const { data, error } = await supabase
      .from('ledgers')
      .select(`
        *,
        ledger_groups (name)
      `)
      .order('name');

    if (error) throw error;

    return data.map(ledger => ({
      id: ledger.id,
      name: ledger.name,
      group: ledger.ledger_groups.name as LedgerGroup,
      openingBalance: ledger.opening_balance,
      currentBalance: ledger.current_balance,
      address: ledger.address,
      phone: ledger.phone,
      gstin: ledger.gstin,
      email: ledger.email,
    }));
  },

  async createLedger(ledger: Omit<Ledger, 'id' | 'currentBalance'>) {
    const { data, error } = await supabase
      .from('ledgers')
      .insert([{
        name: ledger.name,
        group_id: ledger.group,
        opening_balance: ledger.openingBalance,
        address: ledger.address,
        phone: ledger.phone,
        gstin: ledger.gstin,
        email: ledger.email,
        is_billwise: ledger.isBillwise || false,
        is_inventory: ledger.isInventory || false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLedger(id: string, data: Partial<Ledger>) {
    const { data: updatedData, error } = await supabase
      .from('ledgers')
      .update({
        name: data.name,
        group_id: data.group,
        opening_balance: data.openingBalance,
        address: data.address,
        phone: data.phone,
        gstin: data.gstin,
        email: data.email,
        is_billwise: data.isBillwise,
        is_inventory: data.isInventory,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedData;
  },

  async deleteLedger(id: string) {
    const { error } = await supabase
      .from('ledgers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async searchLedgers(query: string) {
    const { data, error } = await supabase
      .from('ledgers')
      .select(`
        *,
        ledger_groups (name)
      `)
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) throw error;

    return data.map(ledger => ({
      id: ledger.id,
      name: ledger.name,
      group: ledger.ledger_groups.name as LedgerGroup,
      openingBalance: ledger.opening_balance,
      currentBalance: ledger.current_balance,
      address: ledger.address,
      phone: ledger.phone,
      gstin: ledger.gstin,
      email: ledger.email,
    }));
  },
};

export const voucherService = {
  async getVouchers() {
    const { data, error } = await supabase
      .from('vouchers')
      .select(`
        *,
        voucher_types (name),
        party_ledger:ledgers!party_ledger_id (name),
        items: voucher_items (
          *,
          ledger: ledgers (name)
        )
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(voucher => ({
      id: voucher.id,
      voucherNumber: voucher.voucher_number,
      type: voucher.voucher_types.name as VoucherType,
      date: voucher.date,
      partyName: voucher.party_ledger.name,
      partyLedgerId: voucher.party_ledger_id,
      items: voucher.items.map(item => ({
        id: item.id,
        particulars: item.ledger.name,
        ledgerId: item.ledger_id,
        amount: item.amount,
        type: item.type,
      })),
      narration: voucher.narration,
      totalAmount: voucher.total_amount,
      createdAt: voucher.created_at,
    }));
  },

  async createVoucher(voucher: Omit<Voucher, 'id' | 'createdAt'>) {
    // Get voucher type ID
    const { data: voucherType, error: typeError } = await supabase
      .from('voucher_types')
      .select('id')
      .eq('name', voucher.type)
      .single();

    if (typeError) throw typeError;

    // Insert voucher
    const { data: voucherData, error: voucherError } = await supabase
      .from('vouchers')
      .insert([{
        type_id: voucherType.id,
        date: voucher.date,
        party_ledger_id: voucher.partyLedgerId,
        narration: voucher.narration,
        total_amount: voucher.totalAmount,
      }])
      .select()
      .single();

    if (voucherError) throw voucherError;

    // Insert voucher items
    const { data: itemsData, error: itemsError } = await supabase
      .from('voucher_items')
      .insert(voucher.items.map(item => ({
        voucher_id: voucherData.id,
        ledger_id: item.ledgerId,
        amount: item.amount,
        type: item.type,
      })))
      .select();

    if (itemsError) throw itemsError;

    return { ...voucherData, items: itemsData };
  },

  async updateVoucher(id: string, data: Partial<Voucher>) {
    const { data: updatedData, error } = await supabase
      .from('vouchers')
      .update({
        date: data.date,
        party_ledger_id: data.partyLedgerId,
        narration: data.narration,
        total_amount: data.totalAmount,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedData;
  },

  async deleteVoucher(id: string) {
    const { error } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    // Get total sales
    const { data: salesType } = await supabase
      .from('voucher_types')
      .select('id')
      .eq('name', 'sales')
      .single();

    const { data: salesData } = await supabase
      .from('vouchers')
      .select('total_amount')
      .eq('type_id', salesType.id);

    // Get total purchases
    const { data: purchaseType } = await supabase
      .from('voucher_types')
      .select('id')
      .eq('name', 'purchase')
      .single();

    const { data: purchaseData } = await supabase
      .from('vouchers')
      .select('total_amount')
      .eq('type_id', purchaseType.id);

    // Get total receivables (sum of debit balances)
    const { data: receivablesData } = await supabase
      .from('ledgers')
      .select('current_balance')
      .gte('current_balance', 0);

    // Get total payables (sum of credit balances)
    const { data: payablesData } = await supabase
      .from('ledgers')
      .select('current_balance')
      .lt('current_balance', 0);

    // Get cash in hand
    const { data: cashGroup } = await supabase
      .from('ledger_groups')
      .select('id')
      .eq('name', 'cash-in-hand')
      .single();

    const { data: cashData } = await supabase
      .from('ledgers')
      .select('current_balance')
      .eq('group_id', cashGroup.id);

    // Get bank balance
    const { data: bankGroup } = await supabase
      .from('ledger_groups')
      .select('id')
      .eq('name', 'bank-accounts')
      .single();

    const { data: bankData } = await supabase
      .from('ledgers')
      .select('current_balance')
      .eq('group_id', bankGroup.id);

    // Get today's transactions
    const today = new Date().toISOString().split('T')[0];
    const { data: todayData } = await supabase
      .from('vouchers')
      .select('id')
      .eq('date', today);

    // Get pending invoices
    const { data: pendingData } = await supabase
      .from('vouchers')
      .select('id')
      .is('narration', null);

    return {
      totalSales: salesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0,
      totalPurchases: purchaseData?.reduce((sum, v) => sum + v.total_amount, 0) || 0,
      totalReceivables: receivablesData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
      totalPayables: Math.abs(payablesData?.reduce((sum, l) => sum + l.current_balance, 0) || 0),
      cashInHand: cashData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
      bankBalance: bankData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
      todayTransactions: todayData?.length || 0,
      pendingInvoices: pendingData?.length || 0,
    };
  },
};

export const stockService = {
  async getStockItems() {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      rate: item.rate,
      value: item.value,
      group: item.group_name,
    }));
  },

  async createStockItem(stockItem: Omit<StockItem, 'id'>) {
    const { data, error } = await supabase
      .from('stock_items')
      .insert([{
        name: stockItem.name,
        unit: stockItem.unit,
        quantity: stockItem.quantity,
        rate: stockItem.rate,
        value: stockItem.value,
        group_name: stockItem.group,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStockItem(id: string, data: Partial<StockItem>) {
    const { data: updatedData, error } = await supabase
      .from('stock_items')
      .update({
        name: data.name,
        unit: data.unit,
        quantity: data.quantity,
        rate: data.rate,
        value: data.value,
        group_name: data.group,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedData;
  },

  async deleteStockItem(id: string) {
    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const companyService = {
  async getCompany(): Promise<Company> {
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .single();

    if (error) throw error;

    return {
      name: data.name,
      address: data.address,
      gstin: data.gstin,
      pan: data.pan,
      phone: data.phone || '',
      email: data.email || '',
      financialYearStart: data.financial_year_start,
      financialYearEnd: data.financial_year_end,
    };
  },

  async updateCompany(company: Company) {
    const { data, error } = await supabase
      .from('company_info')
      .update({
        name: company.name,
        address: company.address,
        gstin: company.gstin,
        pan: company.pan,
        phone: company.phone,
        email: company.email,
        financial_year_start: company.financialYearStart,
        financial_year_end: company.financialYearEnd,
      })
      .eq('id', (await supabase.from('company_info').select('id').single()).data?.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, userData?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async isAuthenticated() {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },
};