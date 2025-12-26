import { useState } from 'react';
import { TallySidebar } from '@/components/layout/TallySidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { LedgerList } from '@/components/ledgers/LedgerList';
import { VoucherForm } from '@/components/vouchers/VoucherForm';
import { ReportsSection } from '@/components/reports/ReportsSection';
import { InventorySection } from '@/components/inventory/InventorySection';
import { VoucherType } from '@/types/tally';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [voucherForm, setVoucherForm] = useState<{ isOpen: boolean; type: VoucherType | null }>({
    isOpen: false,
    type: null
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handleVoucherCreate = (type: VoucherType) => {
    setVoucherForm({ isOpen: true, type });
  };

  const handleSaveVoucher = (voucherData: any) => {
    console.log('Saving voucher:', voucherData);
    setVoucherForm({ isOpen: false, type: null });
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

      {/* Voucher Form Modal */}
      {voucherForm.type && (
        <VoucherForm
          type={voucherForm.type}
          isOpen={voucherForm.isOpen}
          onClose={() => setVoucherForm({ isOpen: false, type: null })}
          onSave={handleSaveVoucher}
        />
      )}
    </div>
  );
};

export default Index;