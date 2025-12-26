import { useState } from 'react';
import { Search, Bell, Calendar, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { company } from '@/data/mockData';
import { toast } from 'sonner';
import { UserProfile } from '@/components/user/UserProfile';

interface TopBarProps {
  currentDate: string;
}

export function TopBar({ currentDate }: TopBarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSearchClick = () => {
    toast.info('Press Ctrl+G to open search');
  };

  return (
    <>
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
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer" 
              size={16}
              onClick={handleSearchClick}
            />
            <Input 
              placeholder="Search vouchers, ledgers, reports... (Ctrl+G)" 
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
              onClick={handleSearchClick}
              readOnly
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsProfileOpen(true)}
          >
            <User size={18} />
          </Button>
        </div>
      </header>
      
      {/* User Profile Modal */}
      <UserProfile 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  );
}