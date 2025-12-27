import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useVouchers } from '@/integrations/supabase/hooks'
import { format } from 'date-fns'

export function RecentTransactions() {
  const { data: vouchers = [], isLoading } = useVouchers()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vouchers.slice(0, 5).map((voucher) => (
            <div key={voucher.id} className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {voucher.party_ledger?.name || 'Unknown Party'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {voucher.voucher_number} • {format(new Date(voucher.date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="ml-auto font-medium">
                ₹{voucher.total_amount.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}