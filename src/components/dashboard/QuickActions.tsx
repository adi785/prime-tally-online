import { useState } from 'react';
import { ArrowUpFromLine, ArrowDownToLine, Wallet, CreditCard, Receipt, Calculator, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoucherType } from '@/types/tally';
import { VoucherForm } from '@/components/vouchers/VoucherForm';
import { toast } from 'sonner';
import { useVoucherTypes } from '@/integrations/supabase/hooks';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface QuickAction {
  id: VoucherType | string;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  color: string;
  bgColor: string;
}

// Define a mapping for icons and colors based on voucher type names
const voucherTypeDisplayConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string; shortcut?: string }> = {
  sales: { icon: <ArrowUpFromLine size={20} />, shortcut: 'F8', color: 'text-success', bgColor: 'bg-success/10 hover:bg-success/20' },
  purchase: { icon: <ArrowDownToLine size={20} />, shortcut: 'F9', color: 'text-warning', bgColor: 'bg-warning/10 hover:bg-warning/20' },
  receipt: { icon: <Wallet size={20} />, shortcut: 'F6', color: 'text-tally-blue', bgColor: 'bg-tally-blue/10 hover:bg-tally-blue/20' },
  payment: { icon: <CreditCard size={20} />, shortcut: 'F5', color: 'text-destructive', bgColor: 'bg-destructive/10 hover:bg-destructive/20' },
  journal: { icon: <Receipt size={20} />, shortcut: 'F7', color: 'text-tally-purple', bgColor: 'bg-tally-purple/10 hover:bg-tally-purple/20' },
  contra: { icon: <Calculator size={20} />, shortcut: 'F4', color: 'text-muted-foreground', bgColor: 'bg-muted hover:bg-muted/80' },
  'credit-note': { icon: <ArrowUpFromLine size={20} />, color: 'text-success', bgColor: 'bg-success/10 hover:bg-success/20' },
  'debit-note': { icon: <ArrowDownToLine size={20} />, color: 'text-warning', bgColor: 'bg-warning/10 hover:bg-warning/20' },
};

const otherQuickActions: Omit<QuickAction, 'color' | 'bgColor'>[] = [
  { id: 'ledger', label: 'Ledger', icon: <BookOpen size={20} />, shortcut: 'Alt+G' },
  { id: 'reports', label: 'Reports', icon: <FileText size={20} />, shortcut: 'Alt+R' },
];

interface QuickActionsProps {
  onVoucherCreate: (type: VoucherType) => void;
}

export function QuickActions({ onVoucherCreate }: QuickActionsProps) {
  const { data: dbVoucherTypes = [], isLoading: isDbVoucherTypesLoading } = useVoucherTypes();
  const [voucherForm, setVoucherForm] = useState<{ isOpen: boolean; type: VoucherType | null }>({
    isOpen: false,
    type: null
  });
  const navigate = useNavigate(); // Initialize useNavigate

  const handleVoucherCreate = (type: VoucherType) => {
    setVoucherForm({ isOpen: true, type });
  };

  const handleSaveVoucher = (voucherData: any) => {
    console.log('Saving voucher:', voucherData);
    setVoucherForm({ isOpen: false, type: null });
  };

  const getActionConfig = (id: string) => {
    if (voucherTypeDisplayConfig[id]) {
      return voucherTypeDisplayConfig[id];
    }
    // Default for non-voucher actions
    return { icon: <FileText size={20} />, color: 'text-foreground', bgColor: 'bg-muted hover:bg-muted/80' };
  };

  if (isDbVoucherTypesLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl flex flex-col items-center gap-2 bg-muted/50 animate-pulse h-28"></div>
          ))}
        </div>
      </div>
    );
  }

  const allQuickActions: QuickAction[] = [
    ...dbVoucherTypes.map(type => ({
      id: type.name as VoucherType,
      label: type.name.replace('-', ' '),
      shortcut: voucherTypeDisplayConfig[type.name]?.shortcut || '', // Add shortcut if available
      ...voucherTypeDisplayConfig[type.name],
    })),
    ...otherQuickActions.map(action => ({
      ...action,
      ...getActionConfig(action.id), // Get default color/bgColor for other actions
    }))
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {allQuickActions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => {
              if (['sales', 'purchase', 'receipt', 'payment', 'journal', 'contra', 'credit-note', 'debit-note'].includes(action.id)) {
                handleVoucherCreate(action.id as VoucherType);
              } else if (action.id === 'ledger') {
                navigate('/ledgers'); // Assuming navigate is available
              } else if (action.id === 'reports') {
                navigate('/reports'); // Assuming navigate is available
              }
            }}
            className={cn(
              "p-4 rounded-xl flex flex-col items-center gap-2 transition-all duration-200 animate-scale-in",
              action.bgColor
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <span className={action.color}>{action.icon}</span>
            <span className="text-sm font-medium text-foreground capitalize">{action.label}</span>
            {action.shortcut && (
              <span className="text-[10px] text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                {action.shortcut}
              </span>
            )}
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