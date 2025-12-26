import { Search, Bell, Calendar, User, Building2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { company } from '@/data/mockData';
import { useAuthState } from '@/integrations/supabase/hooks';
import { useState } from 'react';

interface TopBarProps {
  currentDate: string;
}

export function TopBar({ currentDate }: TopBarProps) {
  const { isAuthenticated, isLoading, user, signOut } = useAuthState();
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (isLoading) {
    return (
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 size={18} />
            <span className="font-semibold text-foreground">{company.name}</span>
          </div>
          <span className="text-muted-foreground text-sm">|</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={14} />
            <span>FY: {company.financialYearStart.split('-')[0]}-{company.financialYearEnd.split('-')[0].slice(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{currentDate}</p>
            <p className="text-xs text-muted-foreground">Current Period</p>
          </div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Company Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 size={18} />
          <span className="font-semibold text-foreground">{company.name}</span>
        </div>
        <span className="text-muted-foreground text-sm">|</span>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={14} />
          <span>FY: {company.financialYearStart.split('-')[0]}-{company.financialYearEnd.split('-')[0].slice(2)}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search vouchers, ledgers, reports... (Ctrl+G)"
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{currentDate}</p>
          <p className="text-xs text-muted-foreground">Current Period</p>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User Menu */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="relative"
          >
            <User size={18} />
          </Button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground">{user?.displayName || user?.email}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                  Company Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                  Change Password
                </button>
              </div>

              <div className="border-t border-border mt-1">
                <button 
                  onClick={signOut}
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LogOut size={14} />
                    Sign Out
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}