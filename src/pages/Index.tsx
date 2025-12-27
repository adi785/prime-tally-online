import { useState } from 'react'
import { TallySidebar } from '@/components/layout/TallySidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { LedgerList } from '@/components/ledgers/LedgerList'
import { VoucherList } from '@/components/vouchers/VoucherList'
import { StockList } from '@/components/inventory/StockList'
import { useLocation } from 'react-router-dom'

const Index = () => {
  const location = useLocation()
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  const renderContent = () => {
    if (location.pathname === '/ledgers') {
      return <LedgerList />
    } else if (location.pathname === '/vouchers') {
      return <VoucherList />
    } else if (location.pathname === '/inventory') {
      return <StockList />
    } else {
      return <Dashboard />
    }
  }

  // Extract active section from pathname
  const getActiveSection = () => {
    const path = location.pathname.substring(1)
    if (path === '') return 'dashboard'
    return path
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <TallySidebar activeSection={getActiveSection()} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar currentDate={currentDate} />
        <main className="flex-1 overflow-y-auto tally-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default Index