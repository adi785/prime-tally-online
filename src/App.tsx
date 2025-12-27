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
import { BalanceSheet } from "./components/reports/BalanceSheet";
import { ProfitLoss } from "./components/reports/ProfitLoss";
import { TrialBalance } from "./components/reports/TrialBalance";
import { DayBook } from "./components/reports/DayBook";

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
          
          {/* Report Routes */}
          <Route path="/reports/balance-sheet" element={
            <ProtectedRoute>
              <div className="p-6">
                <BalanceSheet />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/reports/profit-loss" element={
            <ProtectedRoute>
              <div className="p-6">
                <ProfitLoss />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/reports/trial-balance" element={
            <ProtectedRoute>
              <div className="p-6">
                <TrialBalance />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/reports/day-book" element={
            <ProtectedRoute>
              <div className="p-6">
                <DayBook />
              </div>
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