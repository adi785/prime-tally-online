import { useState } from 'react';
import { useAuthState } from '@/integrations/supabase/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DebugInfo() {
  const [showDetails, setShowDetails] = useState(false);
  const { user, isLoading, isAuthenticated, signOut } = useAuthState();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Debug Information</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Auth Loading</p>
            <p className="font-semibold">{isLoading ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Is Authenticated</p>
            <p className="font-semibold">{isAuthenticated ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">User ID</p>
            <p className="font-semibold">{user?.id || 'None'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">User Email</p>
            <p className="font-semibold">{user?.email || 'None'}</p>
          </div>
        </div>
        
        {showDetails && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Full User Object:</p>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          {isAuthenticated && (
            <Button variant="destructive" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}