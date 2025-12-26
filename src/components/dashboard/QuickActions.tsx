import { useState } from 'react';
import { ArrowUpFromLine, ArrowDownToLine, Wallet, CreditCard, Receipt, Calculator, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoucherType } from '@/types/tally';
import { VoucherForm } from '@/components/vouchers/VoucherForm';
import { toast } from 'sonner';

interface QuickAction {
  id: VoucherType | string;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  { id: 'sales', label: 'Sales', icon: <ArrowUpFromLine size={20} />, shortcut: 'F8', color: 'text-success', bgColor: 'bg-success/10 hover:bg-success/20' },
  { id: 'purchase', label: 'Purchase', icon: <ArrowDownToLine size={20} />, shortcut: 'F9', color: 'text-warning', bgColor: 'bg-warning/10 hover:bg-warning/20' },
  { id: 'receipt', label: 'Receipt', icon: <Wallet size={20} />, shortcut: 'F6', color: 'text-tally-blue', bgColor: 'bg-tally-blue/10 hover:bg-tally-blue/20' },
  { id: 'payment', label: 'Payment', icon: <CreditCard size={20} />, shortcut: 'F5', color: 'text-destructive', bgColor: 'bg-destructive/10 hover:bg-destructive/20' },
  { id: 'journal', label: 'Journal', icon: <Receipt size={20} />, shortcut: 'F7', color: 'text-tally-purple', bgColor: 'bg-tally-purple/10 hover:bg-tally-purple/20' },
  { id: 'contra', label: 'Contra', icon: <Calculator size={20} />, shortcut: 'F4', color: 'text-muted-foreground', bgColor: 'bg-muted hover:bg-muted/80' },
  { id: 'ledger', label: 'Ledger', icon: <BookOpen size={20} />, shortcut: 'Alt+G', color: 'text-foreground', bgColor: 'bg-muted hover:bg-muted/80' },
  { id: 'reports', label: 'Reports', icon: <FileText size={20} />, shortcut: 'Alt+R', color: 'text-foreground', bgColor: 'bg-muted hover:bg-muted/80' },
];

interface QuickActionsProps {
  onVoucherCreate: (type: VoucherType) => void;
}

export function QuickActions({ onVoucherCreate }: QuickActionsProps) {
  const [voucherForm, setVoucherForm] = useState<{ isOpen: boolean; type: VoucherType | null }>({
    isOpen: false,
    type: null
  });

  const handleVoucherCreate = (type: VoucherType) => {
    setVoucherForm({ isOpen: true, type });
  };

  const handleSaveVoucher = (voucherData: any) => {
    console.log('Saving voucher:', voucherData);
    setVoucherForm({ isOpen: false, type: null });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => {
              if (['sales', 'purchase', 'receipt', 'payment', 'journal', 'contra'].includes(action.id)) {
                handleVoucherCreate(action.id as VoucherType);
              }
            }}
            className={cn(
              "p-4 rounded-xl flex flex-col items-center gap-2 transition-all duration-200 animate-scale-in",
              action.bgColor
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <span className={action.color}>{action.icon}</span>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
            <span className="text-[10px] text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
              {action.shortcut}
            </span>
          </button>
        ))}
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
}