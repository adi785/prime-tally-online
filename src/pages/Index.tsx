import { useState } from 'react'
import { TallySidebar } from '@/components/layout/TallySidebar'
import { TopBar } from '@/components/layout/TopBar'
import { useLocation } from 'react-router-dom'
import Dashboard from './Dashboard'
import Ledgers from './Ledgers'
import Vouchers from './Vouchers'
import Inventory from './Inventory'
import Reports from './Reports'
import BalanceSheetPage from './BalanceSheet'
import ProfitLossPage from './ProfitLoss'
import TrialBalancePage from './TrialBalance'
import DayBookPage from './DayBook'
import StockAnalysisPage from './StockAnalysis'
import ReorderAlertsPage from './ReorderAlerts'
import CompanyInfo from './CompanyInfo'
import Settings from './Settings'
import Help from './Help'

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
      return <Ledgers />
    } else if (location.pathname.startsWith('/vouchers')) {
      return <Vouchers />
    } else if (location.pathname === '/inventory') {
      return <Inventory />
    } else if (location.pathname === '/reports') {
      return <Reports />
    } else if (location.pathname === '/reports/balance-sheet') {
      return <BalanceSheetPage />
    } else if (location.pathname === '/reports/profit-loss') {
      return <ProfitLossPage />
    } else if (location.pathname === '/reports/trial-balance') {
      return <TrialBalancePage />
    } else if (location.pathname === '/reports/day-book') {
      return <DayBookPage />
    } else if (location.pathname === '/inventory/analysis') {
      return <StockAnalysisPage />
    } else if (location.pathname === '/inventory/reorder-alerts') {
      return <ReorderAlertsPage />
    } else if (location.pathname === '/company') {
      return <CompanyInfo />
    } else if (location.pathname === '/settings') {
      return <Settings />
    } else if (location.pathname === '/help') {
      return <Help />
    } else {
      return <Dashboard />
    }
  }

  // Extract active section from pathname
  const getActiveSection = () => {
    const path = location.pathname.substring(1)
    if (path === '') return 'dashboard'
    
    // Special handling for nested routes
    if (path.startsWith('reports/')) return 'reports'
    if (path.startsWith('inventory/')) return 'inventory'
    
    return path.split('/')[0]
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