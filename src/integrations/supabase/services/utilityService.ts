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

  async getLedgerGroups(): Promise<Array<{ id: string; name: string }>> {
    console.log('getLedgerGroups called');
    return [
      { id: 'sundry-debtors', name: 'Sundry Debtors' },
      { id: 'sundry-creditors', name: 'Sundry Creditors' },
      { id: 'bank-accounts', name: 'Bank Accounts' },
      { id: 'cash-in-hand', name: 'Cash-in-Hand' },
      { id: 'sales-accounts', name: 'Sales Accounts' },
      { id: 'purchase-accounts', name: 'Purchase Accounts' },
      { id: 'direct-expenses', name: 'Direct Expenses' },
      { id: 'indirect-expenses', name: 'Indirect Expenses' },
      { id: 'direct-incomes', name: 'Direct Incomes' },
      { id: 'indirect-incomes', name: 'Indirect Incomes' },
      { id: 'fixed-assets', name: 'Fixed Assets' },
      { id: 'current-assets', name: 'Current Assets' },
      { id: 'current-liabilities', name: 'Current Liabilities' },
      { id: 'capital-account', name: 'Capital Account' },
    ];
  }
}

export const utilityService = new UtilityService();