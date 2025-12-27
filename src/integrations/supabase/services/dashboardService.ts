import { supabase } from '../client';
import { DashboardMetrics, DashboardMetricsResponse } from '../types';

export class DashboardService {
  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    console.log('getDashboardMetrics called');
    
    try {
      // Use the Supabase function to get dashboard metrics
      const { data, error } = await supabase.rpc('get_dashboard_metrics');
      
      if (error) {
        console.error('getDashboardMetrics error:', error);
        throw error;
      }
      
      // Transform the result to match our DashboardMetrics interface
      const result: DashboardMetricsResponse = {
        totalSales: data.totalSales || 0,
        totalPurchases: data.totalPurchases || 0,
        totalReceivables: data.totalReceivables || 0,
        totalPayables: data.totalPayables || 0,
        cashInHand: data.cashInHand || 0,
        bankBalance: data.bankBalance || 0,
        todayTransactions: data.todayTransactions || 0,
        pendingInvoices: data.pendingInvoices || 0,
        period: {
          start: data.period?.start || new Date().toISOString().split('T')[0],
          end: data.period?.end || new Date().toISOString().split('T')[0],
        }
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