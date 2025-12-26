import { useState } from 'react';
import { X, Save, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LedgerGroup } from '@/types/tally';
import { cn } from '@/lib/utils';

interface CreateLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLedger: (ledger: {
    name: string;
    group: LedgerGroup;
    openingBalance: number;
  }) => void;
}

const groupLabels: Record<LedgerGroup, string> = {
  'sundry-debtors': 'Sundry Debtors',
  'sundry-creditors': 'Sundry Creditors',
  'bank-accounts': 'Bank Accounts',
  'cash-in-hand': 'Cash-in-Hand',
  'sales-accounts': 'Sales Accounts',
  'purchase-accounts': 'Purchase Accounts',
  'direct-expenses': 'Direct Expenses',
  'indirect-expenses': 'Indirect Expenses',
  'direct-incomes': 'Direct Incomes',
  'indirect-incomes': 'Indirect Incomes',
  'fixed-assets': 'Fixed Assets',
  'current-assets': 'Current Assets',
  'current-liabilities': 'Current Liabilities',
  'capital-account': 'Capital Account',
};

const groups = Object.entries(groupLabels).map(([value, label]) => ({
  value: value as LedgerGroup,
  label
}));

export function CreateLedgerModal({ isOpen, onClose, onAddLedger }: CreateLedgerModalProps) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState<LedgerGroup>('sundry-debtors');
  const [openingBalance, setOpeningBalance] = useState('');
  const [isDr, setIsDr] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Ledger name is required';
    }
    
    if (isNaN(parseFloat(openingBalance)) && openingBalance !== '') {
      newErrors.openingBalance = 'Please enter a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const balance = openingBalance ? parseFloat(openingBalance) : 0;
    const signedBalance = isDr ? balance : -balance;
    
    onAddLedger({
      name,
      group,
      openingBalance: signedBalance
    });
    
    // Reset form
    setName('');
    setGroup('sundry-debtors');
    setOpeningBalance('');
    setIsDr(true);
    setErrors({});
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setName('');
    setGroup('sundry-debtors');
    setOpeningBalance('');
    setIsDr(true);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-muted/50">
          <h2 className="text-lg font-semibold text-foreground">Create Ledger</h2>
          <button 
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Ledger Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Ledger Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter ledger name"
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          {/* Group */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Group
            </label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value as LedgerGroup)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {groups.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Opening Balance */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Opening Balance
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <IndianRupee size={14} />
                </div>
                <Input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  className={cn(
                    "pl-8",
                    errors.openingBalance && "border-destructive"
                  )}
                />
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant={isDr ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsDr(true)}
                  className={cn("h-10 px-3", isDr ? "bg-primary text-primary-foreground" : "")}
                >
                  Dr
                </Button>
                <Button
                  type="button"
                  variant={!isDr ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsDr(false)}
                  className={cn("h-10 px-3", !isDr ? "bg-primary text-primary-foreground" : "")}
                >
                  Cr
                </Button>
              </div>
            </div>
            {errors.openingBalance && (
              <p className="text-destructive text-sm mt-1">{errors.openingBalance}</p>
            )}
          </div>
          
          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Save size={16} /> Save Ledger
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}