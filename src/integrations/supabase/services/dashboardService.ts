import { supabase } from '../client';
import { DashboardMetrics, DashboardMetricsResponse } from '../types';

export class DashboardService {
  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    console.log('getDashboardMetrics called');
    try {
      // Get total sales
      const { data: salesData } = await supabase
        .from('vouchers')
        .select('total_amount')
        .eq('type', 'sales');
      
      // Get total purchases
      const { data: purchasesData } = await supabase
        .from('vouchers')
        .select('total_amount')
        .eq('type', 'purchase');
      
      // Get receivables (sundry debtors)
      const { data: debtorsData } = await supabase
        .from('ledgers')
        .select('current_balance')
        .eq('group_name', 'sundry-debtors');
      
      // Get payables (sundry creditors)
      const { data: creditorsData } = await supabase
        .from('ledgers')
        .select('current_balance')
        .eq('group_name', 'sundry-creditors');
      
      // Get cash and bank balances
      const { data: cashData } = await supabase
        .from('ledgers')
        .select('current_balance')
        .in('group_name', ['cash-in-hand', 'bank-accounts']);

      const result = {
        totalSales: salesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0,
        totalPurchases: purchasesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0,
        totalReceivables: debtorsData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
        totalPayables: creditorsData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
        cashInHand: cashData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
        bankBalance: cashData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
        todayTransactions: 0, // Would need to calculate based on today's date
        pendingInvoices: 0, // Would need to calculate based on payment status
        period: {
          start: new Date().toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        },
      };

      console.log('getDashboardMetrics success, result:', result);
      return result;
    } catch (error) {
      console.error('getDashboardMetrics error:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();