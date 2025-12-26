import { useState } from 'react';
import { useLedgers, useDashboardMetrics, useStockItems } from '@/integrations/supabase/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Test() {
  const [showData, setShowData] = useState(false);
  
  const { data: ledgers, isLoading: ledgersLoading, error: ledgersError } = useLedgers();
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: stockItems, isLoading: stockLoading, error: stockError } = useStockItems();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {JSON.stringify(ledgers, null, 2)}
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
                {JSON.stringify(stockItems, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => setShowData(!showData)}>
          {showData ? 'Hide' : 'Show'} Raw Data
        </Button>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
</dyad-write

<dyad-write path="src/App.tsx" description="Add test route to App">
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Test from "./pages/Test";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } />
          <Route path="/signup" element={
            <ProtectedRoute requireAuth={false}>
              <Signup />
            </ProtectedRoute>
          } />
          <Route path="/reset-password" element={
            <ProtectedRoute requireAuth={false}>
              <ResetPassword />
            </ProtectedRoute>
          } />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          <Route path="/test" element={
            <ProtectedRoute>
              <Test />
            </ProtectedRoute>
          } />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;