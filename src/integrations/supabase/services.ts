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
    console.log('getLedgers called with params:', params);
    let query = supabase.from('ledgers').select('*');
    
    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    
    if (params?.group) {
      query = query.eq('group', params.group);
    }
    
    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) {
      console.error('getLedgers error:', error);
      throw error;
    }
    console.log('getLedgers success, data:', data);
    return data || [];
  }

  async getLedger(id: string): Promise<Ledger> {
    console.log('getLedger called with id:', id);
    const { data, error } = await supabase
      .from('ledgers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('getLedger error:', error);
      throw error;
    }
    console.log('getLedger success, data:', data);
    return data;
  }

  async createLedger(data: CreateLedgerRequest): Promise<Ledger> {
    console.log('createLedger called with data:', data);
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
    
    if (error) {
      console.error('createLedger error:', error);
      throw error;
    }
    console.log('createLedger success, result:', result);
    return result;
  }

  async updateLedger(id: string, data: UpdateLedgerRequest): Promise<Ledger> {
    console.log('updateLedger called with id:', id, 'data:', data);
    const { data: result, error } = await supabase
      .from('ledgers')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('updateLedger error:', error);
      throw error;
    }
    console.log('updateLedger success, result:', result);
    return result;
  }

  async deleteLedger(id: string): Promise<void> {
    console.log('deleteLedger called with id:', id);
    const { error } = await supabase
      .from('ledgers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('deleteLedger error:', error);
      throw error;
    }
    console.log('deleteLedger success');
  }

  // Voucher services
  async getVouchers(params?: VoucherQueryParams): Promise<Voucher[]> {
    console.log('getVouchers called with params:', params);
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
    
    if (error) {
      console.error('getVouchers error:', error);
      throw error;
    }
    console.log('getVouchers success, data:', data);
    return data || [];
  }

  async getVoucher(id: string): Promise<Voucher> {
    console.log('getVoucher called with id:', id);
    const { data, error } = await supabase
      .from('vouchers')
      .select(`
        *,
        items: voucher_items(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('getVoucher error:', error);
      throw error;
    }
    console.log('getVoucher success, data:', data);
    return data;
  }

  async createVoucher(data: CreateVoucherRequest): Promise<Voucher> {
    console.log('createVoucher called with data:', data);
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
    
    if (voucherError) {
      console.error('createVoucher error:', voucherError);
      throw voucherError;
    }

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
    
    if (itemsError) {
      console.error('createVoucher items error:', itemsError);
      throw itemsError;
    }

    console.log('createVoucher success, result:', { ...voucherData, items: itemsData });
    return { ...voucherData, items: itemsData };
  }

  async updateVoucher(id: string, data: UpdateVoucherRequest): Promise<Voucher> {
    console.log('updateVoucher called with id:', id, 'data:', data);
    const { data: result, error } = await supabase
      .from('vouchers')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('updateVoucher error:', error);
      throw error;
    }
    console.log('updateVoucher success, result:', result);
    return result;
  }

  async deleteVoucher(id: string): Promise<void> {
    console.log('deleteVoucher called with id:', id);
    // Delete items first
    const { error: itemsError } = await supabase
      .from('voucher_items')
      .delete()
      .eq('voucher_id', id);
    
    if (itemsError) {
      console.error('deleteVoucher items error:', itemsError);
      throw itemsError;
    }

    // Delete voucher
    const { error: voucherError } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', id);
    
    if (voucherError) {
      console.error('deleteVoucher error:', voucherError);
      throw voucherError;
    }
    console.log('deleteVoucher success');
  }

  // Dashboard services
  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    console.log('getDashboardMetrics called');
    try {
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

      const result = {
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

      console.log('getDashboardMetrics success, result:', result);
      return result;
    } catch (error) {
      console.error('getDashboardMetrics error:', error);
      throw error;
    }
  }

  // Stock services
  async getStockItems(params?: StockQueryParams): Promise<StockItem[]> {
    console.log('getStockItems called with params:', params);
    let query = supabase.from('stock_items').select('*');
    
    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    
    if (params?.group) {
      query = query.eq('group_name', params.group);
    }
    
    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) {
      console.error('getStockItems error:', error);
      throw error;
    }
    console.log('getStockItems success, data:', data);
    return data || [];
  }

  async getStockItem(id: string): Promise<StockItem> {
    console.log('getStockItem called with id:', id);
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('getStockItem error:', error);
      throw error;
    }
    console.log('getStockItem success, data:', data);
    return data;
  }

  async createStockItem(data: CreateStockItemRequest): Promise<StockItem> {
    console.log('createStockItem called with data:', data);
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
    
    if (error) {
      console.error('createStockItem error:', error);
      throw error;
    }
    console.log('createStockItem success, result:', result);
    return result;
  }

  async updateStockItem(id: string, data: UpdateStockItemRequest): Promise<StockItem> {
    console.log('updateStockItem called with id:', id, 'data:', data);
    const { data: result, error } = await supabase
      .from('stock_items')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('updateStockItem error:', error);
      throw error;
    }
    console.log('updateStockItem success, result:', result);
    return result;
  }

  async deleteStockItem(id: string): Promise<void> {
    console.log('deleteStockItem called with id:', id);
    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('deleteStockItem error:', error);
      throw error;
    }
    console.log('deleteStockItem success');
  }

  // Company services
  async getCompany(): Promise<Company> {
    console.log('getCompany called');
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .single();
    
    if (error) {
      console.error('getCompany error:', error);
      throw error;
    }
    console.log('getCompany success, data:', data);
    return data;
  }

  async updateCompany(data: UpdateCompanyRequest): Promise<Company> {
    console.log('updateCompany called with data:', data);
    const { data: result, error } = await supabase
      .from('companies')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    
    if (error) {
      console.error('updateCompany error:', error);
      throw error;
    }
    console.log('updateCompany success, result:', result);
    return result;
  }

  // Utility services
  async searchLedgers(query: string): Promise<Ledger[]> {
    console.log('searchLedgers called with query:', query);
    const { data, error } = await supabase
      .from('ledgers')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('searchLedgers error:', error);
      throw error;
    }
    console.log('searchLedgers success, data:', data);
    return data || [];
  }

  async getVoucherTypes(): Promise<Array<{ id: string; name: string }>> {
    console.log('getVoucherTypes called');
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
    console.log('getLedgerGroups called');
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
    console.log('getBalanceSheet called');
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
    console.log('getProfitAndLoss called');
    // This would implement P&L calculation logic
    return {
      income: [],
      expenses: [],
      netProfit: 0,
    };
  }

  async getTrialBalance(): Promise<any> {
    console.log('getTrialBalance called');
    // This would implement trial balance calculation logic
    return {
      ledgers: [],
      totalDebit: 0,
      totalCredit: 0,
    };
  }

  async getDayBook(params: { startDate: string; endDate: string }): Promise<any> {
    console.log('getDayBook called with params:', params);
    // This would implement day book calculation logic
    return {
      transactions: [],
      totalDebit: 0,
      totalCredit: 0,
    };
  }
}

export const supabaseService = new SupabaseService();