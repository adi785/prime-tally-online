import { supabase } from '../client';
import {
  Voucher,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherQueryParams,
} from '../types';

export class VoucherService {
  async getVouchers(userId: string, params?: VoucherQueryParams): Promise<Voucher[]> {
    let query = supabase
      .from('vouchers')
      .select(`
        *,
        type:voucher_types(id, name),
        party:ledgers(id, name),
        items:voucher_items(
          *,
          ledger:ledgers(id, name)
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('date', { ascending: false });

    if (params?.type && params.type !== 'all') {
      // First, get the type_id from the voucher_types table using the name
      const { data: voucherType, error: typeError } = await supabase
        .from('voucher_types')
        .select('id')
        .eq('name', params.type)
        .maybeSingle(); // Changed to maybeSingle()

      if (typeError) {
        console.error(`Error fetching voucher type '${params.type}':`, typeError);
        throw typeError;
      }

      if (voucherType) {
        query = query.eq('type_id', voucherType.id);
      } else {
        // If voucherType is null (not found), it means no vouchers of that type exist or the type name is invalid.
        // To ensure no vouchers are returned for a non-existent type, we can add a condition that will always be false.
        console.warn(`Voucher type '${params.type}' not found in database. No vouchers will be returned for this filter.`);
        query = query.eq('id', '00000000-0000-0000-0000-000000000000'); // A UUID that will never match
      }
    }

    if (params?.startDate && params?.endDate) {
      query = query
        .gte('date', params.startDate)
        .lte('date', params.endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('getVouchers failed:', error);
      throw error;
    }

    return data ?? [];
  }

  async getVoucher(userId: string, id: string): Promise<Voucher | null> {
    const { data, error } = await supabase
      .from('vouchers')
      .select(`
        *,
        type:voucher_types(id, name),
        party:ledgers(id, name),
        items:voucher_items(
          *,
          ledger:ledgers(id, name)
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('getVoucher failed:', error);
      throw error;
    }

    return data;
  }

  async createVoucher(userId: string, data: CreateVoucherRequest): Promise<Voucher> {
    const { data: voucherId, error } = await supabase.rpc(
      'create_voucher_with_items',
      {
        p_voucher_number: data.voucher_number,
        p_type_id: data.type_id,
        p_date: data.date,
        p_party_ledger_id: data.party_ledger_id,
        p_narration: data.narration ?? null,
        p_items: data.items,
        p_user_id: userId,
      }
    );

    if (error || !voucherId) {
      console.error('createVoucher RPC failed:', error);
      throw error ?? new Error('Voucher creation failed');
    }

    const { data: result, error: fetchError } = await supabase
      .from('vouchers')
      .select(`
        *,
        type:voucher_types(id, name),
        party:ledgers(id, name),
        items:voucher_items(
          *,
          ledger:ledgers(id, name)
        )
      `)
      .eq('id', voucherId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError || !result) {
      console.error('createVoucher fetch failed:', fetchError);
      throw fetchError ?? new Error('Voucher created but not retrievable');
    }

    return result;
  }

  async updateVoucher(
    userId: string,
    id: string,
    data: UpdateVoucherRequest
  ): Promise<Voucher> {
    const { data: success, error } = await supabase.rpc(
      'update_voucher_with_items',
      {
        p_voucher_id: id,
        p_voucher_number: data.voucher_number,
        p_type_id: data.type_id,
        p_date: data.date,
        p_party_ledger_id: data.party_ledger_id,
        p_narration: data.narration ?? null,
        p_items: data.items,
        p_user_id: userId,
      }
    );

    if (error || success !== true) {
      console.error('updateVoucher RPC failed:', error);
      throw error ?? new Error('Voucher update failed');
    }

    const { data: result, error: fetchError } = await supabase
      .from('vouchers')
      .select(`
        *,
        type:voucher_types(id, name),
        party:ledgers(id, name),
        items:voucher_items(
          *,
          ledger:ledgers(id, name)
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError || !result) {
      console.error('updateVoucher fetch failed:', fetchError);
      throw fetchError ?? new Error('Updated voucher not retrievable');
    }

    return result;
  }

  async deleteVoucher(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('vouchers')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('deleteVoucher failed:', error);
      throw error;
    }
  }

  async getVoucherTypes(): Promise<
    Array<{ id: string; name: string; description: string }>
  > {
    const { data, error } = await supabase
      .from('voucher_types')
      .select('id, name, description')
      .order('name', { ascending: true });

    if (error) {
      console.error('getVoucherTypes failed:', error);
      throw error;
    }

    return data ?? [];
  }
}

export const voucherService = new VoucherService();