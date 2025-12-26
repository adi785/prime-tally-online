import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TestConnection() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Test basic connection
      const { data: { user } } = await supabase.auth.getUser();
      
      // Test table access
      const { data: ledgers, error: ledgersError } = await supabase
        .from('ledgers')
        .select('count(*)', { count: 'exact' })
        .limit(1);
      
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('count(*)', { count: 'exact' })
        .limit(1);

      setTestResult({
        user: user ? { id: user.id, email: user.email } : null,
        ledgers: ledgers ? ledgers[0].count : 0,
        companies: companies ? companies[0].count : 0,
        ledgersError,
        companiesError,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Test Supabase Connection</CardTitle>
          <Button variant="outline" size="sm" onClick={testConnection} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {testResult ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">User</p>
                <p className="font-semibold">{testResult.user ? `${testResult.user.email} (${testResult.user.id})` : 'Not authenticated'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ledgers Count</p>
                <p className="font-semibold">{testResult.ledgers || 0}</p>
                {testResult.ledgersError && (
                  <p className="text-sm text-destructive">Error: {testResult.ledgersError.message}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Companies Count</p>
                <p className="font-semibold">{testResult.companies || 0}</p>
                {testResult.companiesError && (
                  <p className="text-sm text-destructive">Error: {testResult.companiesError.message}</p>
                )}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Last tested: {testResult.timestamp}
            </div>
            
            {testResult.error && (
              <div className="text-sm text-destructive">
                Error: {testResult.error}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Click "Test Connection" to verify Supabase connectivity.</p>
        )}
      </CardContent>
    </Card>
  );
}