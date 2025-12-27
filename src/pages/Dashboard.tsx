import { useDashboardMetrics } from '@/integrations/supabase/hooks'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { TrendingUp, TrendingDown, Wallet, CreditCard, Landmark, Receipt } from 'lucide-react'

export default function Dashboard() {
  const { data: metrics, isLoading } = useDashboardMetrics()

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sales"
          value={`₹${(metrics?.totalSales || 0).toLocaleString('en-IN')}`}
          description="Total sales this period"
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Total Purchases"
          value={`₹${(metrics?.totalPurchases || 0).toLocaleString('en-IN')}`}
          description="Total purchases this period"
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          trend={{ value: 8.2, isPositive: false }}
        />
        <MetricCard
          title="Receivables"
          value={`₹${(metrics?.totalReceivables || 0).toLocaleString('en-IN')}`}
          description="Amount owed to you"
          icon={<Wallet className="h-4 w-4 text-blue-500" />}
        />
        <MetricCard
          title="Payables"
          value={`₹${(metrics?.totalPayables || 0).toLocaleString('en-IN')}`}
          description="Amount you owe"
          icon={<CreditCard className="h-4 w-4 text-orange-500" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecentTransactions />
        <div className="space-y-4">
          <MetricCard
            title="Cash in Hand"
            value={`₹${(metrics?.cashInHand || 0).toLocaleString('en-IN')}`}
            description="Available cash"
            icon={<Receipt className="h-4 w-4 text-purple-500" />}
          />
          <MetricCard
            title="Bank Balance"
            value={`₹${(metrics?.bankBalance || 0).toLocaleString('en-IN')}`}
            description="Total bank balance"
            icon={<Landmark className="h-4 w-4 text-indigo-500" />}
          />
        </div>
      </div>
    </div>
  )
}