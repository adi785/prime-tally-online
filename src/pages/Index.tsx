import { useState } from 'react'
import { TallySidebar } from '@/components/layout/TallySidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Outlet, useLocation } from 'react-router-dom' // Import Outlet

const Index = () => {
  const location = useLocation()
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  // Extract active section from pathname for sidebar highlighting
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
          <Outlet /> {/* This is where nested routes will be rendered */}
        </main>
      </div>
    </div>
  )
}

export default Index