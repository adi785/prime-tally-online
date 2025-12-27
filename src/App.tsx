import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuth } from '@/integrations/supabase/hooks'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import Ledgers from '@/pages/Ledgers'
import Vouchers from '@/pages/Vouchers'
import Inventory from '@/pages/Inventory'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { useState } from 'react'

const queryClient = new QueryClient()

function App() {
  const { isAuthenticated, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <div className="flex h-screen bg-gray-50">
          {isAuthenticated && (
            <>
              <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar />
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                  toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
                  sidebarOpen={sidebarOpen} 
                />
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/ledgers" element={<Ledgers />} />
                    <Route path="/vouchers" element={<Vouchers />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </>
          )}
          
          {!isAuthenticated && (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App