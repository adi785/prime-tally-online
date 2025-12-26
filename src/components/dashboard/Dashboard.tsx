import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard,
  Landmark,
  Receipt,
  FileText,
  AlertCircle
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { RecentVouchers } from './RecentVouchers';
import { QuickActions } from './QuickActions';
import { PendingItems } from './PendingItems';
import { dashboardMetrics } from '@/data/mockData';
import { VoucherType } from '@/types/tally';

interface DashboardProps {
  onVoucherCreate: (type: VoucherType) => void;
}

export function Dashboard({ onVoucherCreate }: DashboardProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sales"
          value={dashboardMetrics.totalSales}
          icon={TrendingUp}
          variant="success"
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Total Purchases"
          value={dashboardMetrics.totalPurchases}
          icon={TrendingDown}
          variant="warning"
          trend={{ value: 8.2, isPositive: false }}
        />
        <MetricCard
          title="Receivables"
          value={dashboardMetrics.totalReceivables}
          icon={Wallet}
          variant="default"
        />
        <MetricCard
          title="Payables"
          value={dashboardMetrics.totalPayables}
          icon={CreditCard}
          variant="destructive"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Cash in Hand"
          value={dashboardMetrics.cashInHand}
          icon={Receipt}
          variant="default"
        />
        <MetricCard
          title="Bank Balance"
          value={dashboardMetrics.bankBalance}
          icon={Landmark}
          variant="default"
        />
        <MetricCard
          title="Today's Transactions"
          value={dashboardMetrics.todayTransactions}
          icon={FileText}
          variant="default"
          prefix=""
        />
        <MetricCard
          title="Pending Invoices"
          value={dashboardMetrics.pendingInvoices}
          icon={AlertCircle}
          variant="warning"
          prefix=""
        />
      </div>

      {/* Quick Actions */}
      <QuickActions onVoucherCreate={onVoucherCreate} />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentVouchers />
        <PendingItems />
      </div>
    </div>
  );
}
