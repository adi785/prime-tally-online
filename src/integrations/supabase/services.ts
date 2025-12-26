import { supabase } from './client';
import { 
  Ledger, 
  Voucher, 
  DashboardMetrics, 
  StockItem, 
  Company,
  CreateLedgerRequest,
  UpdateLedgerRequest,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  CreateStockItemRequest,
  UpdateStockItemRequest,
  UpdateCompanyRequest,
  LedgerQueryParams,
  VoucherQueryParams,
  StockQueryParams,
  DashboardMetricsResponse
} from './types';

class SupabaseService {
  // Ledger services
  async getLedgers(params?: LedgerQueryParams): Promise<Ledger[]> {
    let query = supabase.from('ledgers').select('*');
    
    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    
    if (params?.group) {
      query = query.eq('group', params.group);
    }
    
    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getLedger(id: string): Promise<Ledger> {
    const { data, error } = await supabase
      .from('ledgers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createLedger(data: CreateLedgerRequest): Promise<Ledger> {
    const { data: result, error } = await supabase
      .from('ledgers')
      .insert([{
        name: data.name,
        group: data.group,
        opening_balance: data.opening_balance,
        address: data.address,
        phone: data.phone,
        gstin: data.gstin,
        email: data.email,
        is_billwise: data.is_billwise,
        is_inventory: data.is_inventory,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async updateLedger(id: string, data: UpdateLedgerRequest): Promise<Ledger> {
    const { data: result, error } = await supabase
      .from('ledgers')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async deleteLedger(id: string): Promise<void> {
    const { error } = await supabase
      .from('ledgers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Voucher services
  async getVouchers(params?: VoucherQueryParams): Promise<Voucher[]> {
    let query = supabase.from('vouchers').select(`
      *,
      items: voucher_items(*)
    `);
    
    if (params?.type) {
      query = query.eq('type', params.type);
    }
    
    if (params?.startDate && params?.endDate) {
      query = query.gte('date', params.startDate).lte('date', params.endDate);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getVoucher(id: string): Promise<Voucher> {
    const { data, error } = await supabase
      .from('vouchers')
      .select(`
        *,
        items: voucher_items(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createVoucher(data: CreateVoucherRequest): Promise<Voucher> {
    // Insert voucher
    const { data: voucherData, error: voucherError } = await supabase
      .from('vouchers')
      .insert([{
        voucher_number: data.voucher_number,
        type: data.type_id,
        date: data.date,
        party_ledger_id: data.party_ledger_id,
        narration: data.narration,
        total_amount: data.items.reduce((sum, item) => sum + item.amount, 0),
      }])
      .select()
      .single();
    
    if (voucherError) throw voucherError;

    // Insert items
    const itemsData = data.items.map(item => ({
      voucher_id: voucherData.id,
      ledger_id: item.ledger_id,
      amount: item.amount,
      type: item.type,
    }));

    const { error: itemsError } = await supabase
      .from('voucher_items')
      .insert(itemsData);
    
    if (itemsError) throw itemsError;

    return { ...voucherData, items: itemsData };
  }

  async updateVoucher(id: string, data: UpdateVoucherRequest): Promise<Voucher> {
    const { data: result, error } = await supabase
      .from('vouchers')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async deleteVoucher(id: string): Promise<void> {
    // Delete items first
    const { error: itemsError } = await supabase
      .from('voucher_items')
      .delete()
      .eq('voucher_id', id);
    
    if (itemsError) throw itemsError;

    // Delete voucher
    const { error: voucherError } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', id);
    
    if (voucherError) throw voucherError;
  }

  // Dashboard services
  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    // Get total sales
    const { data: salesData } = await supabase
      .from('vouchers')
      .select('total_amount')
      .eq('type', 'sales');
    
    // Get total purchases
    const { data: purchasesData } = await supabase
      .from('vouchers')
      .select('total_amount')
      .eq('type', 'purchase');
    
    // Get receivables (sundry debtors)
    const { data: debtorsData } = await supabase
      .from('ledgers')
      .select('current_balance')
      .eq('group', 'sundry-debtors');
    
    // Get payables (sundry creditors)
    const { data: creditorsData } = await supabase
      .from('ledgers')
      .select('current_balance')
      .eq('group', 'sundry-creditors');
    
    // Get cash and bank balances
    const { data: cashData } = await supabase
      .from('ledgers')
      .select('current_balance')
      .in('group', ['cash-in-hand', 'bank-accounts']);

    return {
      totalSales: salesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0,
      totalPurchases: purchasesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0,
      totalReceivables: debtorsData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
      totalPayables: creditorsData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
      cashInHand: cashData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
      bankBalance: cashData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
      todayTransactions: 0, // Would need to calculate based on today's date
      pendingInvoices: 0, // Would need to calculate based on payment status
      period: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    };
  }

  // Stock services
  async getStockItems(params?: StockQueryParams): Promise<StockItem[]> {
    let query = supabase.from('stock_items').select('*');
    
    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    
    if (params?.group) {
      query = query.eq('group_name', params.group);
    }
    
    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getStockItem(id: string): Promise<StockItem> {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createStockItem(data: CreateStockItemRequest): Promise<StockItem> {
    const { data: result, error } = await supabase
      .from('stock_items')
      .insert([{
        name: data.name,
        unit: data.unit,
        quantity: data.quantity,
        rate: data.rate,
        value: data.value,
        group_name: data.group_name,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async updateStockItem(id: string, data: UpdateStockItemRequest): Promise<StockItem> {
    const { data: result, error } = await supabase
      .from('stock_items')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async deleteStockItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Company services
  async getCompany(): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCompany(data: UpdateCompanyRequest): Promise<Company> {
    const { data: result, error } = await supabase
      .from('companies')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  // Utility services
  async searchLedgers(query: string): Promise<Ledger[]> {
    const { data, error } = await supabase
      .from('ledgers')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getVoucherTypes(): Promise<Array<{ id: string; name: string }>> {
    return [
      { id: 'sales', name: 'Sales' },
      { id: 'purchase', name: 'Purchase' },
      { id: 'payment', name: 'Payment' },
      { id: 'receipt', name: 'Receipt' },
      { id: 'journal', name: 'Journal' },
      { id: 'contra', name: 'Contra' },
      { id: 'credit-note', name: 'Credit Note' },
      { id: 'debit-note', name: 'Debit Note' },
    ];
  }

  async getLedgerGroups(): Promise<Array<{ id: string; name: string }>> {
    return [
      { id: 'sundry-debtors', name: 'Sundry Debtors' },
      { id: 'sundry-creditors', name: 'Sundry Creditors' },
      { id: 'bank-accounts', name: 'Bank Accounts' },
      { id: 'cash-in-hand', name: 'Cash-in-Hand' },
      { id: 'sales-accounts', name: 'Sales Accounts' },
      { id: 'purchase-accounts', name: 'Purchase Accounts' },
      { id: 'direct-expenses', name: 'Direct Expenses' },
      { id: 'indirect-expenses', name: 'Indirect Expenses' },
      { id: 'direct-incomes', name: 'Direct Incomes' },
      { id: 'indirect-incomes', name: 'Indirect Incomes' },
      { id: 'fixed-assets', name: 'Fixed Assets' },
      { id: 'current-assets', name: 'Current Assets' },
      { id: 'current-liabilities', name: 'Current Liabilities' },
      { id: 'capital-account', name: 'Capital Account' },
    ];
  }

  // Report services
  async getBalanceSheet(): Promise<any> {
    // This would implement balance sheet calculation logic
    return {
      assets: [],
      liabilities: [],
      equity: [],
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
    };
  }

  async getProfitAndLoss(): Promise<any> {
    // This would implement P&L calculation logic
    return {
      income: [],
      expenses: [],
      netProfit: 0,
    };
  }

  async getTrialBalance(): Promise<any> {
    // This would implement trial balance calculation logic
    return {
      ledgers: [],
      totalDebit: 0,
      totalCredit: 0,
    };
  }

  async getDayBook(params: { startDate: string; endDate: string }): Promise<any> {
    // This would implement day book calculation logic
    return {
      transactions: [],
      totalDebit: 0,
      totalCredit: 0,
    };
  }
}

export const supabaseService = new SupabaseService();