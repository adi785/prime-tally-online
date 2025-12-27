import { supabase } from '../client';
import { Ledger, CreateLedgerRequest, UpdateLedgerRequest, LedgerQueryParams } from '../types';

export class LedgerService {
  async getLedgers(params?: LedgerQueryParams): Promise<Ledger[]> {
    console.log('getLedgers called with params:', params);
    
    let query = supabase.from('ledgers').select(`
      *,
      group:ledger_groups(name)
    `);
    
    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    
    if (params?.group) {
      query = query.eq('group_name', params.group);
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
      .select(`
        *,
        group:ledger_groups(name)
      `)
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
        group_name: data.group,
        group_id: data.group_id,
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

  async getLedgerGroups(): Promise<Array<{ id: string; name: string }>> {
    console.log('getLedgerGroups called');
    
    const { data, error } = await supabase
      .from('ledger_groups')
      .select('id, name')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('getLedgerGroups error:', error);
      throw error;
    }
    
    console.log('getLedgerGroups success, data:', data);
    return data || [];
  }
}

export const ledgerService = new LedgerService();