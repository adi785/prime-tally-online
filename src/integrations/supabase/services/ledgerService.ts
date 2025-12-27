import { supabase } from '../client';
import {
  Ledger,
  CreateLedgerRequest,
  UpdateLedgerRequest,
  LedgerQueryParams,
} from '../types';

export class LedgerService {
  private async getUserId(): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user.id;
  }

  // ==============================
  // READ: Multiple Ledgers
  // ==============================
  async getLedgers(params?: LedgerQueryParams): Promise<Ledger[]> {
    const userId = await this.getUserId();
    let query = supabase
      .from('ledgers')
      .select(`
        *,
        group:ledger_groups(id, name)
      `)
      .eq('user_id', userId) // Filter by user_id
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    if (params?.groupId) {
      query = query.eq('group_id', params.groupId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('getLedgers failed:', error);
      throw error;
    }

    // Transform the data to match our interface
    return (data ?? []).map(ledger => ({
      ...ledger,
      group_name: ledger.group?.name || ledger.group_name,
      group_id: ledger.group?.id || ledger.group_id,
      group: ledger.group?.name || ledger.group_name,
    }));
  }

  // ==============================
  // READ: Single Ledger
  // ==============================
  async getLedger(id: string): Promise<Ledger | null> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('ledgers')
      .select(`
        *,
        group:ledger_groups(id, name)
      `)
      .eq('id', id)
      .eq('user_id', userId) // Filter by user_id
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('getLedger failed:', error);
      throw error;
    }

    if (!data) return null;

    // Transform the data to match our interface
    return {
      ...data,
      group_name: data.group?.name || data.group_name,
      group_id: data.group?.id || data.group_id,
      group: data.group?.name || data.group_name,
    };
  }

  // ==============================
  // CREATE
  // ==============================
  async createLedger(data: CreateLedgerRequest): Promise<Ledger> {
    const userId = await this.getUserId();
    const { data: result, error } = await supabase
      .from('ledgers')
      .insert({
        ...data,
        user_id: userId, // Add user_id
        opening_balance: data.opening_balance ?? 0,
        address: data.address ?? null,
        phone: data.phone ?? null,
        gstin: data.gstin ?? null,
        email: data.email ?? null,
        is_billwise: data.is_billwise ?? false,
        is_inventory: data.is_inventory ?? false,
        is_active: true,
      })
      .select(`
        *,
        group:ledger_groups(id, name)
      `)
      .single();

    if (error || !result) {
      console.error('createLedger failed:', error);
      throw error ?? new Error('Ledger creation failed');
    }

    // Transform the data to match our interface
    return {
      ...result,
      group_name: result.group?.name || result.group_name,
      group_id: result.group?.id || result.group_id,
      group: result.group?.name || result.group_name,
    };
  }

  // ==============================
  // UPDATE
  // ==============================
  async updateLedger(id: string, data: UpdateLedgerRequest): Promise<Ledger> {
    const userId = await this.getUserId();
    const { data: result, error } = await supabase
      .from('ledgers')
      .update({
        name: data.name,
        group_id: data.group_id,
        opening_balance: data.opening_balance ?? 0,
        address: data.address ?? null,
        phone: data.phone ?? null,
        gstin: data.gstin ?? null,
        email: data.email ?? null,
        is_billwise: data.is_billwise ?? false,
        is_inventory: data.is_inventory ?? false,
      })
      .eq('id', id)
      .eq('user_id', userId) // Filter by user_id
      .eq('is_active', true)
      .select(`
        *,
        group:ledger_groups(id, name)
      `)
      .maybeSingle();

    if (error || !result) {
      console.error('updateLedger failed:', error);
      throw error ?? new Error('Ledger not found or update blocked');
    }

    // Transform the data to match our interface
    return {
      ...result,
      group_name: result.group?.name || result.group_name,
      group_id: result.group?.id || result.group_id,
      group: result.group?.name || result.group_name,
    };
  }

  // ==============================
  // DELETE (Soft Delete – ERP Safe)
  // ==============================
  async deleteLedger(id: string): Promise<void> {
    const userId = await this.getUserId();
    const { error } = await supabase
      .from('ledgers')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId); // Filter by user_id

    if (error) {
      console.error('deleteLedger failed:', error);
      throw error;
    }
  }

  // ==============================
  // SEARCH (Consistent Shape)
  // ==============================
  async searchLedgers(search: string): Promise<Ledger[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('ledgers')
      .select(`
        *,
        group:ledger_groups(id, name)
      `)
      .eq('user_id', userId) // Filter by user_id
      .eq('is_active', true)
      .ilike('name', `%${search}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error('searchLedgers failed:', error);
      throw error;
    }

    // Transform the data to match our interface
    return (data ?? []).map(ledger => ({
      ...ledger,
      group_name: ledger.group?.name || ledger.group_name,
      group_id: ledger.group?.id || ledger.group_id,
      group: ledger.group?.name || ledger.group_name,
    }));
  }

  // ==============================
  // LEDGER GROUPS (Read-only for authenticated users)
  // ==============================
  async getLedgerGroups(): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await supabase
      .from('ledger_groups')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      console.error('getLedgerGroups failed:', error);
      throw error;
    }

    return data ?? [];
  }
}

export const ledgerService = new LedgerService();