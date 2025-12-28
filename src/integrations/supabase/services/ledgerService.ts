import { supabase } from '../client';
import {
  Ledger,
  CreateLedgerRequest,
  UpdateLedgerRequest,
  LedgerQueryParams,
} from '../customTypes';

export class LedgerService {
  async getLedgers(userId: string, params?: LedgerQueryParams): Promise<Ledger[]> {
    let query = supabase
      .from('ledgers')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    if (params?.groupId) {
      query = query.eq('group_name', params.groupId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('getLedgers failed:', error);
      throw error;
    }

    return data ?? [];
  }

  async getLedger(userId: string, id: string): Promise<Ledger | null> {
    const { data, error } = await supabase
      .from('ledgers')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('getLedger failed:', error);
      throw error;
    }

    return data;
  }

  async createLedger(userId: string, data: CreateLedgerRequest): Promise<Ledger> {
    const { data: result, error } = await supabase
      .from('ledgers')
      .insert({
        name: data.name,
        group_name: data.group_id, // group_id is actually group_name from the form
        user_id: userId,
        opening_balance: data.opening_balance ?? 0,
        current_balance: data.opening_balance ?? 0,
        address: data.address ?? null,
        phone: data.phone ?? null,
        gstin: data.gstin ?? null,
        email: data.email ?? null,
        is_billwise: data.is_billwise ?? false,
        is_inventory: data.is_inventory ?? false,
      })
      .select()
      .single();

    if (error || !result) {
      console.error('createLedger failed:', error);
      throw error ?? new Error('Ledger creation failed');
    }

    return result;
  }

  async updateLedger(userId: string, id: string, data: UpdateLedgerRequest): Promise<Ledger> {
    const { data: result, error } = await supabase
      .from('ledgers')
      .update({
        name: data.name,
        group_name: data.group_id, // group_id is actually group_name from the form
        opening_balance: data.opening_balance ?? 0,
        address: data.address ?? null,
        phone: data.phone ?? null,
        gstin: data.gstin ?? null,
        email: data.email ?? null,
        is_billwise: data.is_billwise ?? false,
        is_inventory: data.is_inventory ?? false,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error || !result) {
      console.error('updateLedger failed:', error);
      throw error ?? new Error('Ledger not found or update blocked');
    }

    return result;
  }

  async deleteLedger(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('ledgers')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('deleteLedger failed:', error);
      throw error;
    }
  }

  async searchLedgers(userId: string, search: string): Promise<Ledger[]> {
    const { data, error } = await supabase
      .from('ledgers')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${search}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error('searchLedgers failed:', error);
      throw error;
    }

    return data ?? [];
  }

  async getLedgerGroups(): Promise<Array<{ id: string; name: string }>> {
    // Since there's no ledger_groups table, return predefined groups
    const groups = [
      { id: 'Sundry Debtors', name: 'Sundry Debtors' },
      { id: 'Sundry Creditors', name: 'Sundry Creditors' },
      { id: 'Bank Accounts', name: 'Bank Accounts' },
      { id: 'Cash-in-Hand', name: 'Cash-in-Hand' },
      { id: 'Capital Account', name: 'Capital Account' },
      { id: 'Fixed Assets', name: 'Fixed Assets' },
      { id: 'Direct Incomes', name: 'Direct Incomes' },
      { id: 'Indirect Incomes', name: 'Indirect Incomes' },
      { id: 'Direct Expenses', name: 'Direct Expenses' },
      { id: 'Indirect Expenses', name: 'Indirect Expenses' },
      { id: 'Duties & Taxes', name: 'Duties & Taxes' },
      { id: 'Sales Accounts', name: 'Sales Accounts' },
      { id: 'Purchase Accounts', name: 'Purchase Accounts' },
    ];
    return groups;
  }
}

export const ledgerService = new LedgerService();