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
  ApiResponse,
  PaginatedResponse,
  DashboardMetricsResponse
} from './types';

class SupabaseService {
  // Ledger services
  async getLedgers(params?: LedgerQueryParams): Promise<Ledger[]> {
    let query = supabase
      .from('ledgers')
      .select('*')
      .order('name', { ascending: true });

    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    if (params?.group) {
      query = query.eq('group', params.group);
    }

    const { data, error } = await query;
    
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
      .update({
        name: data.name,
        group: data.group,
        opening_balance: data.opening_balance,
        address: data.address,
        phone: data.phone,
        gstin: data.gstin,
        email: data.email,
        is_billwise: data.is_billwise,
        is_inventory: data.is_inventory,
      })
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
    let query = supabase
      .from('vouchers')
      .select(`
        *,
        items: voucher_items(*)
      `)
      .order('date', { ascending: false });

    if (params?.type) {
      query = query.eq('type', params.type);
    }

    if (params?.startDate && params?.endDate) {
      query = query.gte('date', params.startDate).lte('date', params.endDate);
    }

    if (params?.party) {
      query = query.ilike('party_name', `%${params.party}%`);
    }

    const { data, error } = await query;
    
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

    // Insert voucher items
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

    return voucherData;
  }

  async updateVoucher(id: string, data: UpdateVoucherRequest): Promise<Voucher> {
    // Update voucher
    const { data: voucherData, error: voucherError } = await supabase
      .from('vouchers')
      .update({
        voucher_number: data.voucher_number,
        type: data.type_id,
        date: data.date,
        party_ledger_id: data.party_ledger_id,
        narration: data.narration,
        total_amount: data.items?.reduce((sum, item) => sum + item.amount, 0) || 0,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (voucherError) throw voucherError;

    // Update voucher items
    if (data.items) {
      // Delete existing items
      await supabase
        .from('voucher_items')
        .delete()
        .eq('voucher_id', id);

      // Insert new items
      const itemsData = data.items.map(item => ({
        voucher_id: id,
        ledger_id: item.ledger_id,
        amount: item.amount,
        type: item.type,
      }));

      const { error: itemsError } = await supabase
        .from('voucher_items')
        .insert(itemsData);
      
      if (itemsError) throw itemsError;
    }

    return voucherData;
  }

  async deleteVoucher(id: string): Promise<void> {
    // Delete voucher items first
    await supabase
      .from('voucher_items')
      .delete()
      .eq('voucher_id', id);

    // Delete voucher
    const { error } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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
    
    // Get ledger balances
    const { data: ledgersData } = await supabase
      .from('ledgers')
      .select('current_balance');
    
    const totalSales = salesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0;
    const totalPurchases = purchasesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0;
    const totalReceivables = ledgersData?.filter(l => l.current_balance > 0).reduce((sum, l) => sum + l.current_balance, 0) || 0;
    const totalPayables = ledgersData?.filter(l => l.current_balance < 0).reduce((sum, l) => sum + Math.abs(l.current_balance), 0) || 0;

    return {
      totalSales,
      totalPurchases,
      totalReceivables,
      totalPayables,
      cashInHand: 125000,
      bankBalance: 1060000,
      todayTransactions: 5,
      pendingInvoices: 8,
      period: {
        start: '2024-04-01',
        end: '2024-12-31',
      },
    };
  }

  // Stock services
  async getStockItems(params?: StockQueryParams): Promise<StockItem[]> {
    let query = supabase
      .from('stock_items')
      .select('*')
      .order('name', { ascending: true });

    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    if (params?.group) {
      query = query.eq('group_name', params.group);
    }

    const { data, error } = await query;
    
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
      .update({
        name: data.name,
        unit: data.unit,
        quantity: data.quantity,
        rate: data.rate,
        value: data.value,
        group_name: data.group_name,
      })
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
      .update({
        name: data.name,
        address: data.address,
        gstin: data.gstin,
        pan: data.pan,
        phone: data.phone,
        email: data.email,
        financial_year_start: data.financialYearStart,
        financial_year_end: data.financialYearEnd,
      })
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
    const { data, error } = await supabase
      .from('voucher_types')
      .select('id, name');
    
    if (error) throw error;
    return data || [];
  }

  async getLedgerGroups(): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await supabase
      .from('ledger_groups')
      .select('id, name');
    
    if (error) throw error;
    return data || [];
  }

  // Report services
  async getBalanceSheet(): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_balance_sheet');
    
    if (error) throw error;
    return data;
  }

  async getProfitAndLoss(): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_profit_loss');
    
    if (error) throw error;
    return data;
  }

  async getTrialBalance(): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_trial_balance');
    
    if (error) throw error;
    return data;
  }

  async getDayBook(params: { startDate: string; endDate: string }): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_day_book', {
        start_date: params.startDate,
        end_date: params.endDate,
      });
    
    if (error) throw error;
    return data;
  }
}

export const supabaseService = new SupabaseService();