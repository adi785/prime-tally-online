import { supabase } from '../client';
import { Voucher, CreateVoucherRequest, UpdateVoucherRequest, VoucherQueryParams } from '../types';

export class VoucherService {
  async getVouchers(params?: VoucherQueryParams): Promise<Voucher[]> {
    console.log('getVouchers called with params:', params);
    
    let query = supabase.from('vouchers').select(`
      *,
      type:voucher_types(name),
      party:ledgers(name),
      items:voucher_items(*, ledger:ledgers(name))
    `);
    
    if (params?.type) {
      query = query.eq('type_id', params.type);
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
        type:voucher_types(name),
        party:ledgers(name),
        items:voucher_items(*, ledger:ledgers(name))
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
    
    // Use the Supabase function to create voucher with items
    const { data: result, error } = await supabase
      .rpc('create_voucher_with_items', {
        p_voucher_number: data.voucher_number,
        p_type_id: data.type_id,
        p_date: data.date,
        p_party_ledger_id: data.party_ledger_id,
        p_narration: data.narration,
        p_items: data.items
      });
      
    if (error) {
      console.error('createVoucher error:', error);
      throw error;
    }
    
    // Fetch the created voucher with all details
    const { data: voucherData } = await supabase
      .from('vouchers')
      .select(`
        *,
        type:voucher_types(name),
        party:ledgers(name),
        items:voucher_items(*, ledger:ledgers(name))
      `)
      .eq('id', result)
      .single();
    
    console.log('createVoucher success, result:', voucherData);
    return voucherData;
  }

  async updateVoucher(id: string, data: UpdateVoucherRequest): Promise<Voucher> {
    console.log('updateVoucher called with id:', id, 'data:', data);
    
    // Use the Supabase function to update voucher with items
    const { error } = await supabase
      .rpc('update_voucher_with_items', {
        p_voucher_id: id,
        p_voucher_number: data.voucher_number,
        p_type_id: data.type_id,
        p_date: data.date,
        p_party_ledger_id: data.party_ledger_id,
        p_narration: data.narration,
        p_items: data.items
      });
      
    if (error) {
      console.error('updateVoucher error:', error);
      throw error;
    }
    
    // Fetch the updated voucher with all details
    const { data: result } = await supabase
      .from('vouchers')
      .select(`
        *,
        type:voucher_types(name),
        party:ledgers(name),
        items:voucher_items(*, ledger:ledgers(name))
      `)
      .eq('id', id)
      .single();
    
    console.log('updateVoucher success, result:', result);
    return result;
  }

  async deleteVoucher(id: string): Promise<void> {
    console.log('deleteVoucher called with id:', id);
    
    // Delete items first (cascading should handle this, but being explicit)
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

  async getVoucherTypes(): Promise<Array<{ id: string; name: string; description: string }>> {
    console.log('getVoucherTypes called');
    
    const { data, error } = await supabase
      .from('voucher_types')
      .select('id, name, description')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('getVoucherTypes error:', error);
      throw error;
    }
    
    console.log('getVoucherTypes success, data:', data);
    return data || [];
  }
}

export const voucherService = new VoucherService();