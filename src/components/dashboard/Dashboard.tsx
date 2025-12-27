import { useState } from 'react'
import { useDashboardMetrics } from '@/integrations/supabase/hooks'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RecentVouchers } from '@/components/dashboard/RecentVouchers'
import { PendingItems } from '@/components/dashboard/PendingItems'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { FinancialChart } from '@/components/dashboard/FinancialChart'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { TrendingUp, TrendingDown, Wallet, CreditCard, Landmark, Receipt, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button' // Import Button for chart period/type selection

export function Dashboard() {
  const { data: metrics, isLoading, error } = useDashboardMetrics()
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Loading your business overview...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-5 rounded-xl border bg-card h-32 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <div className="text-destructive mb-4">
            <AlertCircle size={32} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Dashboard</h3>
          <p className="text-muted-foreground">Failed to load dashboard metrics. Please try again.</p>
        </div>
      </div>
    )
  }

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
          value={metrics?.totalSales || 0} 
          icon={TrendingUp} 
          variant="success" 
          trend={{ value: 12.5, isPositive: true }} 
        />
        <MetricCard 
          title="Total Purchases" 
          value={metrics?.totalPurchases || 0} 
          icon={TrendingDown} 
          variant="warning" 
          trend={{ value: 8.2, isPositive: false }} 
        />
        <MetricCard 
          title="Receivables" 
          value={metrics?.totalReceivables || 0} 
          icon={Wallet} 
          variant="default" 
        />
        <MetricCard 
          title="Payables" 
          value={metrics?.totalPayables || 0} 
          icon={CreditCard} 
          variant="destructive" 
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Cash in Hand" 
          value={metrics?.cashInHand || 0} 
          icon={Receipt} 
          variant="default" 
        />
        <MetricCard 
          title="Bank Balance" 
          value={metrics?.bankBalance || 0} 
          icon={Landmark} 
          variant="default" 
        />
        <MetricCard 
          title="Today's Transactions" 
          value={metrics?.todayTransactions || 0} 
          icon={FileText} 
          variant="default" 
          prefix="" 
        />
        <MetricCard 
          title="Pending Invoices" 
          value={metrics?.pendingInvoices || 0} 
          icon={AlertCircle} 
          variant="warning" 
          prefix="" 
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FinancialChart type={chartType} period={chartPeriod} />
          <div className="flex gap-4">
            <div className="flex gap-2">
              <Button 
                size="sm"
                variant={chartType === 'bar' ? 'default' : 'outline'}
                onClick={() => setChartType('bar')}
              >
                Bar
              </Button>
              <Button 
                size="sm"
                variant={chartType === 'line' ? 'default' : 'outline'}
                onClick={() => setChartType('line')}
              >
                Line
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm"
                variant={chartPeriod === 'monthly' ? 'default' : 'outline'}
                onClick={() => setChartPeriod('monthly')}
              >
                Monthly
              </Button>
              <Button 
                size="sm"
                variant={chartPeriod === 'quarterly' ? 'default' : 'outline'}
                onClick={() => setChartPeriod('quarterly')}
              >
                Quarterly
              </Button>
              <Button 
                size="sm"
                variant={chartPeriod === 'yearly' ? 'default' : 'outline'}
                onClick={() => setChartPeriod('yearly')}
              >
                Yearly
              </Button>
            </div>
          </div>
        </div>
        <ActivityFeed />
      </div>

      {/* Quick Actions and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentVouchers />
        </div>
        <div>
          <PendingItems />
          <div className="mt-6">
            <QuickActions onVoucherCreate={(type) => console.log('Create voucher:', type)} />
          </div>
        </div>
      </div>
    </div>
  )
}