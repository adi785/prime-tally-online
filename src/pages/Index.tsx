import { useState } from 'react';
import { TallySidebar } from '@/components/layout/TallySidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { LedgerList } from '@/components/ledgers/LedgerList';
import { VoucherModal } from '@/components/vouchers/VoucherModal';
import { ReportsSection } from '@/components/reports/ReportsSection';
import { InventorySection } from '@/components/inventory/InventorySection';
import { VoucherType } from '@/types/tally';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [voucherModal, setVoucherModal] = useState<{ isOpen: boolean; type: VoucherType }>({
    isOpen: false,
    type: 'sales'
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handleVoucherCreate = (type: VoucherType) => {
    setVoucherModal({ isOpen: true, type });
  };

  const closeVoucherModal = () => {
    setVoucherModal({ ...voucherModal, isOpen: false });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onVoucherCreate={handleVoucherCreate} />;
      case 'ledgers':
        return <LedgerList />;
      case 'reports':
      case 'balance-sheet':
      case 'profit-loss':
      case 'trial-balance':
      case 'day-book':
        return <ReportsSection />;
      case 'inventory':
        return <InventorySection />;
      case 'sales':
      case 'purchase':
      case 'receipt':
      case 'payment':
      case 'journal':
      case 'contra':
        handleVoucherCreate(activeSection as VoucherType);
        setActiveSection('dashboard');
        return <Dashboard onVoucherCreate={handleVoucherCreate} />;
      default:
        return <Dashboard onVoucherCreate={handleVoucherCreate} />;
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
      />
    </div>
  );
};

export default Index;
