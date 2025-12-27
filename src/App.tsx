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
  return <>{children}</>
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
  return <>{children}</>
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
          
          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          
          {/* Main Sections */}
          <Route path="/ledgers/*" element={
            <ProtectedRoute>
              <Ledgers />
            </ProtectedRoute>
          } />
          <Route path="/vouchers/*" element={
            <ProtectedRoute>
              <Vouchers />
            </ProtectedRoute>
          } />
          <Route path="/inventory/*" element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          } />
          <Route path="/reports/*" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          
          {/* Report Pages */}
          <Route path="/reports/balance-sheet" element={
            <ProtectedRoute>
              <BalanceSheetPage />
            </ProtectedRoute>
          } />
          <Route path="/reports/profit-loss" element={
            <ProtectedRoute>
              <ProfitLossPage />
            </ProtectedRoute>
          } />
          <Route path="/reports/trial-balance" element={
            <ProtectedRoute>
              <TrialBalancePage />
            </ProtectedRoute>
          } />
          <Route path="/reports/day-book" element={
            <ProtectedRoute>
              <DayBookPage />
            </ProtectedRoute>
          } />
          
          {/* Inventory Pages */}
          <Route path="/inventory/analysis" element={
            <ProtectedRoute>
              <StockAnalysisPage />
            </ProtectedRoute>
          } />
          <Route path="/inventory/reorder-alerts" element={
            <ProtectedRoute>
              <ReorderAlertsPage />
            </ProtectedRoute>
          } />
          
          {/* Settings and Info */}
          <Route path="/company" element={
            <ProtectedRoute>
              <CompanyInfo />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App