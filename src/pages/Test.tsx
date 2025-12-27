import { useState } from 'react';
import { 
  useLedgers, 
  useDashboardMetrics, 
  useStockItems, 
  useVouchers,
  useCompany,
  useVoucherTypes,
  useLedgerGroups
} from '@/integrations/supabase/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Test() {
  const [showData, setShowData] = useState(false);
  
  const { data: ledgers, isLoading: ledgersLoading, error: ledgersError } = useLedgers();
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: stockItems, isLoading: stockLoading, error: stockError } = useStockItems();
  const { data: vouchers, isLoading: vouchersLoading, error: vouchersError } = useVouchers();
  const { data: company, isLoading: companyLoading, error: companyError } = useCompany();
  const { data: voucherTypes, isLoading: typesLoading, error: typesError } = useVoucherTypes();
  const { data: ledgerGroups, isLoading: groupsLoading, error: groupsError } = useLedgerGroups();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ledgers</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading: {ledgersLoading ? 'Yes' : 'No'}</p>
            <p>Error: {ledgersError ? ledgersError.message : 'None'}</p>
            <p>Count: {ledgers?.length || 0}</p>
            {showData && ledgers && (
              <pre className="mt-2 text-xs overflow-auto max-h-40">
                {JSON.stringify(ledgers.slice(0, 5), null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading: {metricsLoading ? 'Yes' : 'No'}</p>
            <p>Error: {metricsError ? metricsError.message : 'None'}</p>
            <p>Data: {metrics ? JSON.stringify(metrics) : 'None'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading: {stockLoading ? 'Yes' : 'No'}</p>
            <p>Error: {stockError ? stockError.message : 'None'}</p>
            <p>Count: {stockItems?.length || 0}</p>
            {showData && stockItems && (
              <pre className="mt-2 text-xs overflow-auto max-h-40">
                {JSON.stringify(stockItems.slice(0, 5), null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading: {vouchersLoading ? 'Yes' : 'No'}</p>
            <p>Error: {vouchersError ? vouchersError.message : 'None'}</p>
            <p>Count: {vouchers?.length || 0}</p>
            {showData && vouchers && (
              <pre className="mt-2 text-xs overflow-auto max-h-40">
                {JSON.stringify(vouchers.slice(0, 3), null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Company</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading: {companyLoading ? 'Yes' : 'No'}</p>
            <p>Error: {companyError ? companyError.message : 'None'}</p>
            <p>Name: {company?.name || 'None'}</p>
            {showData && company && (
              <pre className="mt-2 text-xs overflow-auto max-h-40">
                {JSON.stringify(company, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Voucher Types</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading: {typesLoading ? 'Yes' : 'No'}</p>
            <p>Error: {typesError ? typesError.message : 'None'}</p>
            <p>Count: {voucherTypes?.length || 0}</p>
            {showData && voucherTypes && (
              <pre className="mt-2 text-xs overflow-auto max-h-40">
                {JSON.stringify(voucherTypes, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ledger Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading: {groupsLoading ? 'Yes' : 'No'}</p>
            <p>Error: {groupsError ? groupsError.message : 'None'}</p>
            <p>Count: {ledgerGroups?.length || 0}</p>
            {showData && ledgerGroups && (
              <pre className="mt-2 text-xs overflow-auto max-h-40">
                {JSON.stringify(ledgerGroups, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex gap-4">
        <Button onClick={() => setShowData(!showData)}>
          {showData ? 'Hide' : 'Show'} Raw Data
        </Button>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    </div>
  );
}