import { useState } from 'react';
import { TallySidebar } from '@/components/layout/TallySidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { LedgerList } from '@/components/ledgers/LedgerList';
import { VoucherModal } from '@/components/vouchers/VoucherModal';
import { ReportsSection } from '@/components/reports/ReportsSection';
import { InventorySection } from '@/components/inventory/InventorySection';
import { CompanyInfo } from '@/components/company/CompanyInfo';
import { Settings } from '@/components/settings/Settings';
import { GroupsList } from '@/components/masters/GroupsList';
import { StockItemsList } from '@/components/masters/StockItemsList';
import { VoucherType } from '@/types/tally';
import { toast } from 'sonner';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { HelpModal } from '@/components/help/HelpModal';
import { SearchModal } from '@/components/search/SearchModal';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [voucherModal, setVoucherModal] = useState<{ 
    isOpen: boolean; 
    type: VoucherType 
  }>({
    isOpen: false,
    type: 'sales'
  });
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onF1: () => {
      setActiveSection('help');
    },
    onF2: () => {
      // Date change - in a real app this would open a date picker
      toast.info('Date change functionality would open here');
    },
    onF3: () => {
      // Change company
      toast.info('Company change functionality would open here');
    },
    onF4: () => {
      handleVoucherCreate('contra');
    },
    onF5: () => {
      handleVoucherCreate('payment');
    },
    onF6: () => {
      handleVoucherCreate('receipt');
    },
    onF7: () => {
      handleVoucherCreate('journal');
    },
    onF8: () => {
      handleVoucherCreate('sales');
    },
    onF9: () => {
      handleVoucherCreate('purchase');
    },
    onCtrlG: () => {
      setIsSearchModalOpen(true);
    },
    onAltR: () => {
      setActiveSection('reports');
    },
    onAltG: () => {
      setActiveSection('ledgers');
    }
  });

  const handleVoucherCreate = (type: VoucherType) => {
    setVoucherModal({ 
      isOpen: true, 
      type 
    });
  };

  const closeVoucherModal = () => {
    setVoucherModal({ 
      ...voucherModal, 
      isOpen: false 
    });
  };

  const handleSaveVoucher = (voucher: {
    date: string;
    partyLedgerId: string;
    items: any[];
    narration: string;
  }) => {
    // In a real app, this would save to a database
    console.log('Saving voucher:', voucher);
    toast.success('Voucher saved successfully');
  };

  const handleNavigate = (section: string, data?: any) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard 
            onVoucherCreate={handleVoucherCreate} 
            onNavigate={handleNavigate} 
          />
        );
      case 'ledgers':
        return <LedgerList />;
      case 'groups':
        return <GroupsList />;
      case 'stock-items':
        return <StockItemsList />;
      case 'reports':
      case 'balance-sheet':
      case 'profit-loss':
      case 'trial-balance':
      case 'day-book':
        return <ReportsSection />;
      case 'inventory':
        return <InventorySection />;
      case 'company':
        return <CompanyInfo />;
      case 'settings':
        return <Settings />;
      case 'sales':
      case 'purchase':
      case 'receipt':
      case 'payment':
      case 'journal':
      case 'contra':
        handleVoucherCreate(activeSection as VoucherType);
        setActiveSection('dashboard');
        return (
          <Dashboard 
            onVoucherCreate={handleVoucherCreate} 
            onNavigate={handleNavigate} 
          />
        );
      case 'help':
        setIsHelpModalOpen(true);
        setActiveSection('dashboard');
        return (
          <Dashboard 
            onVoucherCreate={handleVoucherCreate} 
            onNavigate={handleNavigate} 
          />
        );
      default:
        return (
          <Dashboard 
            onVoucherCreate={handleVoucherCreate} 
            onNavigate={handleNavigate} 
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <TallySidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar currentDate={currentDate} />
        <main className="flex-1 overflow-y-auto tally-scrollbar">
          {renderContent()}
        </main>
      </div>
      
      {/* Voucher Modal */}
      <VoucherModal 
        type={voucherModal.type} 
        isOpen={voucherModal.isOpen} 
        onClose={closeVoucherModal}
        onSave={handleSaveVoucher}
      />
      
      {/* Help Modal */}
      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
      
      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default Index;