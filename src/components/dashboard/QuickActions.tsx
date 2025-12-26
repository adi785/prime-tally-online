import { ArrowUpFromLine, ArrowDownToLine, Wallet, CreditCard, Receipt, Calculator, BookOpen, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoucherType } from '@/types/tally';

interface QuickAction {
  id: VoucherType | string;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  { 
    id: 'sales', 
    label: 'Sales', 
    icon: <ArrowUpFromLine size={20} />, 
    shortcut: 'F8', 
    color: 'text-success', 
    bgColor: 'bg-success/10 hover:bg-success/20' 
  },
  { 
    id: 'purchase', 
    label: 'Purchase', 
    icon: <ArrowDownToLine size={20} />, 
    shortcut: 'F9', 
    color: 'text-warning', 
    bgColor: 'bg-warning/10 hover:bg-warning/20' 
  },
  { 
    id: 'receipt', 
    label: 'Receipt', 
    icon: <Wallet size={20} />, 
    shortcut: 'F6', 
    color: 'text-tally-blue', 
    bgColor: 'bg-tally-blue/10 hover:bg-tally-blue/20' 
  },
  { 
    id: 'payment', 
    label: 'Payment', 
    icon: <CreditCard size={20} />, 
    shortcut: 'F5', 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10 hover:bg-destructive/20' 
  },
  { 
    id: 'journal', 
    label: 'Journal', 
    icon: <Receipt size={20} />, 
    shortcut: 'F7', 
    color: 'text-tally-purple', 
    bgColor: 'bg-tally-purple/10 hover:bg-tally-purple/20' 
  },
  { 
    id: 'contra', 
    label: 'Contra', 
    icon: <Calculator size={20} />, 
    shortcut: 'F4', 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted hover:bg-muted/80' 
  },
  { 
    id: 'ledger', 
    label: 'Ledger', 
    icon: <BookOpen size={20} />, 
    shortcut: 'Alt+G', 
    color: 'text-foreground', 
    bgColor: 'bg-muted hover:bg-muted/80' 
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: <FileText size={20} />, 
    shortcut: 'Alt+R', 
    color: 'text-foreground', 
    bgColor: 'bg-muted hover:bg-muted/80' 
  },
];

interface QuickActionsProps {
  onVoucherCreate: (type: VoucherType) => void;
  onNavigate: (section: string) => void;
}

export function QuickActions({ onVoucherCreate, onNavigate }: QuickActionsProps) {
  const handleActionClick = (id: string) => {
    if (['sales', 'purchase', 'receipt', 'payment', 'journal', 'contra', 'credit-note', 'debit-note'].includes(id)) {
      onVoucherCreate(id as VoucherType);
    } else if (id === 'ledger') {
      onNavigate('ledgers');
    } else if (id === 'reports') {
      onNavigate('reports');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Quick Actions</h3>
        <button 
          className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          onClick={() => onNavigate('ledgers')}
        >
          <Plus size={14} /> Create Ledger
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.id)}
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
    </div>
  );
}