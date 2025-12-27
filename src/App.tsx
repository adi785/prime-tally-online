import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Index from "./pages/Index"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Ledgers from "./pages/Ledgers"
import Vouchers from "./pages/Vouchers"
import Inventory from "./pages/Inventory"
import Reports from "./pages/Reports"
import BalanceSheetPage from "./pages/BalanceSheet"
import ProfitLossPage from "./pages/ProfitLoss"
import TrialBalancePage from "./pages/TrialBalance"
import DayBookPage from "./pages/DayBook"
import StockAnalysisPage from "./pages/StockAnalysis"
import ReorderAlertsPage from "./pages/ReorderAlerts"
import CompanyInfo from "./pages/CompanyInfo"
import Settings from "./pages/Settings"
import Help from "./pages/Help"
import ResetPasswordPage from "./pages/ResetPassword"
import { useAuthState } from "./integrations/supabase/hooks"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthState()
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthState()
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          } />
          
          {/* Protected Routes with Index as Layout */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} /> {/* Default protected route */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ledgers" element={<Ledgers />} />
            <Route path="vouchers" element={<Vouchers />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/balance-sheet" element={<BalanceSheetPage />} />
            <Route path="reports/profit-loss" element={<ProfitLossPage />} />
            <Route path="reports/trial-balance" element={<TrialBalancePage />} />
            <Route path="reports/day-book" element={<DayBookPage />} />
            <Route path="inventory/analysis" element={<StockAnalysisPage />} />
            <Route path="inventory/reorder-alerts" element={<ReorderAlertsPage />} />
            <Route path="company" element={<CompanyInfo />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
            {/* Catch-all for protected routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          {/* Fallback for any unmatched public routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App