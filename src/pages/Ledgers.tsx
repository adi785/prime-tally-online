import { useLedgers } from '@/integrations/supabase/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Ledgers() {
  const { data: ledgers = [], isLoading } = useLedgers()

  if (isLoading) {
    return <div className="p-6">Loading ledgers...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ledgers</h1>
        <p className="text-muted-foreground">Manage your account ledgers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ledger List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Name</th>
                  <th className="py-2 text-left">Group</th>
                  <th className="py-2 text-right">Opening Balance</th>
                  <th className="py-2 text-right">Current Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledgers.map((ledger) => (
                  <tr key={ledger.id} className="border-b">
                    <td className="py-2">{ledger.name}</td>
                    <td className="py-2">{ledger.group_name}</td>
                    <td className="py-2 text-right">
                      ₹{ledger.opening_balance?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="py-2 text-right">
                      ₹{ledger.current_balance?.toLocaleString('en-IN') || '0'}
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