import { supabase } from '../client';
import { 
  Voucher, 
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherQueryParams
} from '../types';

export class VoucherService {
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
}

export const voucherService = new VoucherService();