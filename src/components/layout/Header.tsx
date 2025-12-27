import { useState } from 'react'
import { Menu, X, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/integrations/supabase/hooks'

interface HeaderProps {
  toggleSidebar: () => void
  sidebarOpen: boolean
}

export function Header({ toggleSidebar, sidebarOpen }: HeaderProps) {
  const { user, signOut } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="bg-background border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <h1 className="text-xl font-bold ml-4">TallyPrime</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <User className="h-5 w-5" />
            </Button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    signOut()
                    setUserMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}