import { useVouchers } from '@/integrations/supabase/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export default function Vouchers() {
  const { data: vouchers = [], isLoading } = useVouchers()

  if (isLoading) {
    return <div className="p-6">Loading vouchers...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Vouchers</h1>
        <p className="text-muted-foreground">Manage your financial transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voucher List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Voucher No.</th>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Party</th>
                  <th className="py-2 text-left">Type</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="border-b">
                    <td className="py-2">{voucher.voucher_number}</td>
                    <td className="py-2">{format(new Date(voucher.date), 'MMM dd, yyyy')}</td>
                    <td className="py-2">{voucher.party_ledger?.name || 'Unknown'}</td>
                    <td className="py-2 capitalize">{voucher.type}</td>
                    <td className="py-2 text-right">
                      ₹{voucher.total_amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}