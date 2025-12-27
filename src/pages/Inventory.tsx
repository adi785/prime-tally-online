import { useStockItems } from '@/integrations/supabase/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Inventory() {
  const { data: stockItems = [], isLoading } = useStockItems()

  if (isLoading) {
    return <div className="p-6">Loading inventory...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">Manage your stock items</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Name</th>
                  <th className="py-2 text-left">Group</th>
                  <th className="py-2 text-center">Unit</th>
                  <th className="py-2 text-right">Quantity</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.group_name}</td>
                    <td className="py-2 text-center">{item.unit}</td>
                    <td className="py-2 text-right">{item.quantity.toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right">₹{item.value.toLocaleString('en-IN')}</td>
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