import { TrendingUp, TrendingDown, Wallet, CreditCard, Landmark, Receipt, FileText, AlertCircle } from 'lucide-react'
import { MetricCard } from './MetricCard'
import { useDashboardMetrics } from '@/integrations/supabase/hooks'

export function Dashboard() {
  const { data: metrics, isLoading, error } = useDashboardMetrics()

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
      
      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 h-80 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">Sales vs Purchases</h3>
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Sales chart will appear here
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 h-80 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">Financial Trend</h3>
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Financial trend chart will appear here
          </div>
        </div>
      </div>
    </div>
  )
}