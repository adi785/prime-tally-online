import { supabase } from '../client';
import {
  Voucher,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherQueryParams,
} from '../customTypes';

export class VoucherService {
  async getVouchers(userId: string, params?: VoucherQueryParams): Promise<Voucher[]> {
    let query = supabase
      .from('vouchers')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (params?.type && params.type !== 'all') {
      query = query.eq('type', params.type);
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
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('getVoucher failed:', error);
      throw error;
    }

    return data;
  }

  async createVoucher(userId: string, data: CreateVoucherRequest): Promise<Voucher> {
    const { data: result, error } = await supabase
      .from('vouchers')
      .insert({
        voucher_number: data.voucher_number,
        type: data.type_id, // type_id from form is actually the type name
        date: data.date,
        party_ledger_id: data.party_ledger_id,
        party_name: 'Party', // Will need to be fetched from ledger
        narration: data.narration ?? null,
        total_amount: data.items?.reduce((sum, item) => sum + item.amount, 0) ?? 0,
        user_id: userId,
      })
      .select()
      .single();

    if (error || !result) {
      console.error('createVoucher failed:', error);
      throw error ?? new Error('Voucher creation failed');
    }

    return result;
  }

  async updateVoucher(
    userId: string,
    id: string,
    data: UpdateVoucherRequest
  ): Promise<Voucher> {
    const { data: result, error } = await supabase
      .from('vouchers')
      .update({
        voucher_number: data.voucher_number,
        type: data.type_id,
        date: data.date,
        party_ledger_id: data.party_ledger_id,
        narration: data.narration ?? null,
        total_amount: data.items?.reduce((sum, item) => sum + item.amount, 0) ?? 0,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error || !result) {
      console.error('updateVoucher failed:', error);
      throw error ?? new Error('Voucher update failed');
    }

    return result;
  }

  async deleteVoucher(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('deleteVoucher failed:', error);
      throw error;
    }
  }

  async getVoucherTypes(): Promise<Array<{ id: string; name: string; description: string }>> {
    // Since there's no voucher_types table, return predefined types
    return [
      { id: 'sales', name: 'sales', description: 'Sales Voucher' },
      { id: 'purchase', name: 'purchase', description: 'Purchase Voucher' },
      { id: 'receipt', name: 'receipt', description: 'Receipt Voucher' },
      { id: 'payment', name: 'payment', description: 'Payment Voucher' },
      { id: 'journal', name: 'journal', description: 'Journal Voucher' },
      { id: 'contra', name: 'contra', description: 'Contra Voucher' },
      { id: 'credit-note', name: 'credit-note', description: 'Credit Note' },
      { id: 'debit-note', name: 'debit-note', description: 'Debit Note' },
    ];
  }
}

export const voucherService = new VoucherService();
