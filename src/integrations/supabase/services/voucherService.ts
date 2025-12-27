import { supabase } from '../client';
import {
  Voucher,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherQueryParams,
} from '../types';

export class VoucherService {
  // ==============================
  // READ: Multiple Vouchers
  // ==============================
  async getVouchers(params?: VoucherQueryParams): Promise<Voucher[]> {
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
      .eq('is_active', true)
      .order('date', { ascending: false });

    if (params?.typeId) {
      query = query.eq('type_id', params.typeId);
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

  // ==============================
  // READ: Single Voucher
  // ==============================
  async getVoucher(id: string): Promise<Voucher | null> {
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
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('getVoucher failed:', error);
      throw error;
    }

    return data;
  }

  // ==============================
  // CREATE (Atomic via RPC)
  // ==============================
  async createVoucher(data: CreateVoucherRequest): Promise<Voucher> {
    const { data: voucherId, error } = await supabase.rpc(
      'create_voucher_with_items',
      {
        p_voucher_number: data.voucher_number,
        p_type_id: data.type_id,
        p_date: data.date,
        p_party_ledger_id: data.party_ledger_id,
        p_narration: data.narration ?? null,
        p_items: data.items,
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
      .maybeSingle();

    if (fetchError || !result) {
      console.error('createVoucher fetch failed:', fetchError);
      throw fetchError ?? new Error('Voucher created but not retrievable');
    }

    return result;
  }

  // ==============================
  // UPDATE (Atomic via RPC)
  // ==============================
  async updateVoucher(
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
      .maybeSingle();

    if (fetchError || !result) {
      console.error('updateVoucher fetch failed:', fetchError);
      throw fetchError ?? new Error('Updated voucher not retrievable');
    }

    return result;
  }

  // ==============================
  // DELETE (Soft Delete – ERP Safe)
  // ==============================
  async deleteVoucher(id: string): Promise<void> {
    const { error } = await supabase
      .from('vouchers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('deleteVoucher failed:', error);
      throw error;
    }
  }

  // ==============================
  // MASTER DATA: Voucher Types
  // ==============================
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
