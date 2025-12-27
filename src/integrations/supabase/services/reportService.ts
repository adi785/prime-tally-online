import { supabase } from '../client';
import { Ledger, Voucher, VoucherItem } from '../types';

export class ReportService {
  async getBalanceSheet(userId: string): Promise<any> {
    console.log('getBalanceSheet called');

    const { data: ledgers, error: ledgersError } = await supabase
      .from('ledgers')
      .select(`
        id, name, current_balance,
        group:ledger_groups(name)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (ledgersError) {
      console.error('getBalanceSheet ledgers error:', ledgersError);
      throw ledgersError;
    }

    const assets: any[] = [];
    const liabilities: any[] = [];
    const equity: any[] = [];

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    const ledgerMap = new Map<string, Ledger>(ledgers.map(l => [l.id, l as Ledger]));

    const currentAssets = ledgers.filter(l => ['Cash-in-Hand', 'Bank Accounts', 'Sundry Debtors'].includes(l.group?.name || ''));
    const fixedAssets = ledgers.filter(l => l.group?.name === 'Fixed Assets');
    const currentLiabilities = ledgers.filter(l => ['Sundry Creditors', 'Duties & Taxes'].includes(l.group?.name || ''));
    const capitalAccount = ledgers.filter(l => l.group?.name === 'Capital Account');

    const calculateCategoryTotal = (items: any[]) => items.reduce((sum, item) => sum + item.current_balance, 0);

    if (currentAssets.length > 0) {
      const total = calculateCategoryTotal(currentAssets);
      assets.push({
        category: 'Current Assets',
        items: currentAssets.map(l => ({ name: l.name, amount: l.current_balance })),
        total: total
      });
      totalAssets += total;
    }
    if (fixedAssets.length > 0) {
      const total = calculateCategoryTotal(fixedAssets);
      assets.push({
        category: 'Fixed Assets',
        items: fixedAssets.map(l => ({ name: l.name, amount: l.current_balance })),
        total: total
      });
      totalAssets += total;
    }

    if (currentLiabilities.length > 0) {
      const total = calculateCategoryTotal(currentLiabilities);
      liabilities.push({
        category: 'Current Liabilities',
        items: currentLiabilities.map(l => ({ name: l.name, amount: Math.abs(l.current_balance) })),
        total: Math.abs(total)
      });
      totalLiabilities += Math.abs(total);
    }

    if (capitalAccount.length > 0) {
      const total = calculateCategoryTotal(capitalAccount);
      equity.push({
        name: 'Capital Account',
        amount: total
      });
      totalEquity += total;
    }

    equity.push({
      name: 'Retained Earnings',
      amount: 0
    });

    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity: totalEquity + (equity.find(e => e.name === 'Retained Earnings')?.amount || 0),
    };
  }

  async getProfitAndLoss(userId: string): Promise<any> {
    console.log('getProfitAndLoss called');

    const { data: vouchers, error: vouchersError } = await supabase
      .from('vouchers')
      .select(`
        id, type, total_amount, date,
        items:voucher_items(ledger_id, amount, type)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (vouchersError) {
      console.error('getProfitAndLoss vouchers error:', vouchersError);
      throw vouchersError;
    }

    const { data: ledgers, error: ledgersError } = await supabase
      .from('ledgers')
      .select(`
        id, name, current_balance,
        group:ledger_groups(name)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (ledgersError) {
      console.error('getProfitAndLoss ledgers error:', ledgersError);
      throw ledgersError;
    }

    let totalSales = 0;
    let totalPurchases = 0;
    let otherIncome = 0;
    let directExpenses = 0;
    let indirectExpenses = 0;

    vouchers.forEach(v => {
      if (v.type === 'sales') {
        totalSales += v.total_amount;
      } else if (v.type === 'purchase') {
        totalPurchases += v.total_amount;
      }
    });

    ledgers.forEach(l => {
      if (l.group?.name === 'Indirect Incomes') {
        otherIncome += l.current_balance;
      } else if (l.group?.name === 'Direct Expenses') {
        directExpenses += Math.abs(l.current_balance);
      } else if (l.group?.name === 'Indirect Expenses') {
        indirectExpenses += Math.abs(l.current_balance);
      }
    });

    const income = [
      {
        category: 'Sales Revenue',
        items: [{ name: 'Sales', amount: totalSales }],
        total: totalSales
      },
      {
        category: 'Other Income',
        items: [{ name: 'Interest Income', amount: otherIncome }],
        total: otherIncome
      }
    ];

    const expenses = [
      {
        category: 'Cost of Goods Sold',
        items: [{ name: 'Purchases', amount: totalPurchases }],
        total: totalPurchases
      },
      {
        category: 'Direct Expenses',
        items: ledgers.filter(l => l.group?.name === 'Direct Expenses').map(l => ({ name: l.name, amount: Math.abs(l.current_balance) })),
        total: directExpenses
      },
      {
        category: 'Indirect Expenses',
        items: ledgers.filter(l => l.group?.name === 'Indirect Expenses').map(l => ({ name: l.name, amount: Math.abs(l.current_balance) })),
        total: indirectExpenses
      }
    ];

    const totalIncome = income.reduce((sum, cat) => sum + cat.total, 0);
    const totalExpenses = expenses.reduce((sum, cat) => sum + cat.total, 0);
    const netProfit = totalIncome - totalExpenses;

    return {
      income,
      expenses,
      totalIncome,
      totalExpenses,
      netProfit,
    };
  }

  async getTrialBalance(userId: string): Promise<any> {
    console.log('getTrialBalance called');

    const { data: ledgers, error: ledgersError } = await supabase
      .from('ledgers')
      .select(`
        id, name, current_balance,
        group:ledger_groups(name)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (ledgersError) {
      console.error('getTrialBalance ledgers error:', ledgersError);
      throw ledgersError;
    }

    const trialBalanceLedgers = ledgers.map(ledger => {
      const debit = ledger.current_balance > 0 ? ledger.current_balance : 0;
      const credit = ledger.current_balance < 0 ? Math.abs(ledger.current_balance) : 0;
      
      return {
        name: ledger.name,
        group: ledger.group?.name || 'N/A',
        debit,
        credit
      };
    });

    const totalDebit = trialBalanceLedgers.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = trialBalanceLedgers.reduce((sum, l) => sum + l.credit, 0);

    return {
      ledgers: trialBalanceLedgers,
      totalDebit,
      totalCredit,
    };
  }

  async getDayBook(userId: string, params: { startDate: string; endDate: string }): Promise<any> {
    console.log('getDayBook called with params:', params);

    const { data: vouchers, error: vouchersError } = await supabase
      .from('vouchers')
      .select(`
        id, voucher_number, type, date, narration, total_amount,
        party_ledger:ledgers(name),
        items:voucher_items(ledger_id, amount, type, ledger:ledgers(name))
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('date', params.startDate)
      .lte('date', params.endDate)
      .order('date', { ascending: true });

    if (vouchersError) {
      console.error('getDayBook vouchers error:', vouchersError);
      throw vouchersError;
    }

    const transactions: any[] = [];

    vouchers.forEach(voucher => {
      voucher.items.forEach(item => {
        transactions.push({
          date: voucher.date,
          voucherNumber: voucher.voucher_number,
          voucherType: voucher.type.toUpperCase(),
          particulars: item.ledger?.name || 'N/A',
          debit: item.type === 'debit' ? item.amount : 0,
          credit: item.type === 'credit' ? item.amount : 0,
        });
      });
    });

    const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);

    return {
      transactions,
      totalDebit,
      totalCredit,
    };
  }
}

export const reportService = new ReportService();