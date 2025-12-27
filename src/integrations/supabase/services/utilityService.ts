import { supabase } from '../client';
import { Ledger } from '../types';

export class UtilityService {
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

export const utilityService = new UtilityService();