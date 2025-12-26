import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoucherType, VoucherItem } from '@/types/tally';
import { ledgers as initialLedgers } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoucherModalProps {
  type: VoucherType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (voucher: {
    date: string;
    partyLedgerId: string;
    items: VoucherItem[];
    narration: string;
  }) => void;
}

const voucherConfig: Record<VoucherType, { 
  title: string; 
  color: string; 
  bgColor: string;
  debitLabel: string;
  creditLabel: string;
}> = {
  sales: { 
    title: 'Sales Voucher', 
    color: 'text-success', 
    bgColor: 'bg-success',
    debitLabel: 'Debit Account',
    creditLabel: 'Credit Account'
  },
  purchase: { 
    title: 'Purchase Voucher', 
    color: 'text-warning', 
    bgColor: 'bg-warning',
    debitLabel: 'Debit Account',
    creditLabel: 'Credit Account'
  },
  receipt: { 
    title: 'Receipt Voucher', 
    color: 'text-tally-blue', 
    bgColor: 'bg-tally-blue',
    debitLabel: 'Debit Account',
    creditLabel: 'Credit Account'
  },
  payment: { 
    title: 'Payment Voucher', 
    color: 'text-destructive', 
    bgColor: 'bg-destructive',
    debitLabel: 'Debit Account',
    creditLabel: 'Credit Account'
  },
  journal: { 
    title: 'Journal Voucher', 
    color: 'text-tally-purple', 
    bgColor: 'bg-tally-purple',
    debitLabel: 'Debit Account',
    creditLabel: 'Credit Account'
  },
  contra: { 
    title: 'Contra Voucher', 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted-foreground',
    debitLabel: 'Debit Account',
    creditLabel: 'Credit Account'
  },
  'credit-note': { 
    title: 'Credit Note', 
    color: 'text-success', 
    bgColor: 'bg-success',
    debitLabel: 'Debit Account',
    creditLabel: 'Credit Account'
  },
  'debit-note': { 
    title: 'Debit Note', 
    color: 'text-warning', 
    bgColor: 'bg-warning',
    debitLabel: 'Debit Account',
    creditLabel: 'Credit Account'
  },
};

interface LineItem {
  id: string;
  ledgerId: string;
  amount: string;
  type: 'debit' | 'credit';
}

export function VoucherModal({ type, isOpen, onClose, onSave }: VoucherModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [voucherNumber, setVoucherNumber] = useState('');
  const [partyLedger, setPartyLedger] = useState('');
  const [narration, setNarration] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', ledgerId: '', amount: '', type: 'debit' },
    { id: '2', ledgerId: '', amount: '', type: 'credit' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const config = voucherConfig[type];
  
  // Filter ledgers based on type
  const partyLedgers = initialLedgers.filter(l => 
    ['sundry-debtors', 'sundry-creditors'].includes(l.group)
  );
  
  const accountLedgers = initialLedgers.filter(l => 
    !['sundry-debtors', 'sundry-creditors'].includes(l.group)
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setVoucherNumber('');
      setPartyLedger('');
      setNarration('');
      setItems([
        { id: '1', ledgerId: '', amount: '', type: 'debit' },
        { id: '2', ledgerId: '', amount: '', type: 'credit' }
      ]);
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    if (!partyLedger) {
      newErrors.partyLedger = 'Party account is required';
    }
    
    let hasDebit = false;
    let hasCredit = false;
    let totalDebit = 0;
    let totalCredit = 0;
    
    items.forEach((item, index) => {
      if (!item.ledgerId) {
        newErrors[`item-${index}-ledger`] = 'Account is required';
      }
      
      if (!item.amount || isNaN(parseFloat(item.amount))) {
        newErrors[`item-${index}-amount`] = 'Valid amount is required';
      }
      
      if (item.type === 'debit') {
        hasDebit = true;
        totalDebit += parseFloat(item.amount) || 0;
      } else {
        hasCredit = true;
        totalCredit += parseFloat(item.amount) || 0;
      }
    });
    
    if (!hasDebit || !hasCredit) {
      newErrors.items = 'At least one debit and one credit entry required';
    }
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      newErrors.balance = 'Total debit must equal total credit';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = () => {
    setItems([
      ...items, 
      { 
        id: Date.now().toString(), 
        ledgerId: '', 
        amount: '', 
        type: items.length % 2 === 0 ? 'debit' : 'credit' 
      }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 2) {
      setItems(items.filter(item => item.id !== id));
    } else {
      toast.error('Voucher must have at least one debit and one credit entry');
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const toggleItemType = (id: string) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, type: item.type === 'debit' ? 'credit' : 'debit' } 
        : item
    ));
  };

  const totalAmount = items.reduce((sum, item) => 
    sum + (parseFloat(item.amount) || 0), 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    const voucherItems: VoucherItem[] = items.map(item => ({
      id: item.id,
      particulars: initialLedgers.find(l => l.id === item.ledgerId)?.name || '',
      ledgerId: item.ledgerId,
      amount: parseFloat(item.amount),
      type: item.type
    }));
    
    onSave({
      date,
      partyLedgerId: partyLedger,
      items: voucherItems,
      narration
    });
    
    onClose();
    toast.success(`${config.title} saved successfully`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={cn("px-6 py-4 flex items-center justify-between", config.bgColor)}>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">{config.title}</h2>
            <span className="text-white/70 text-sm">F8</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto tally-scrollbar">
          <div className="p-6 space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Date *
                </label>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className={cn(errors.date && "border-destructive")}
                />
                {errors.date && (
                  <p className="text-destructive text-sm mt-1">{errors.date}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Voucher No.
                </label>
                <Input 
                  placeholder="Auto-generate" 
                  value={voucherNumber} 
                  onChange={(e) => setVoucherNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Party Account *
                </label>
                <select
                  value={partyLedger}
                  onChange={(e) => setPartyLedger(e.target.value)}
                  className={cn(
                    "w-full h-10 px-3 rounded-md border border-input bg-background text-sm",
                    errors.partyLedger && "border-destructive"
                  )}
                >
                  <option value="">Select Party</option>
                  {partyLedgers.map(ledger => (
                    <option key={ledger.id} value={ledger.id}>{ledger.name}</option>
                  ))}
                </select>
                {errors.partyLedger && (
                  <p className="text-destructive text-sm mt-1">{errors.partyLedger}</p>
                )}
              </div>
            </div>
            
            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Particulars *</label>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={addItem}
                  className="gap-1"
                >
                  <Plus size={14} /> Add Row
                </Button>
              </div>
              
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground w-24">
                        Type
                      </th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">
                        Account
                      </th>
                      <th className="text-right px-4 py-2 text-sm font-medium text-muted-foreground w-40">
                        Amount
                      </th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const ledger = initialLedgers.find(l => l.id === item.ledgerId);
                      return (
                        <tr key={item.id} className="border-b border-border last:border-b-0">
                          <td className="p-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-full h-9 text-xs font-medium",
                                item.type === 'debit' 
                                  ? "bg-success/10 text-success border-success/20" 
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                              )}
                              onClick={() => toggleItemType(item.id)}
                            >
                              {item.type === 'debit' ? 'Dr' : 'Cr'}
                            </Button>
                          </td>
                          <td className="p-2">
                            <select
                              value={item.ledgerId}
                              onChange={(e) => updateItem(item.id, 'ledgerId', e.target.value)}
                              className={cn(
                                "w-full h-9 px-3 rounded-md border border-input bg-background text-sm",
                                errors[`item-${index}-ledger`] && "border-destructive"
                              )}
                            >
                              <option value="">Select Account</option>
                              {accountLedgers.map(ledger => (
                                <option key={ledger.id} value={ledger.id}>{ledger.name}</option>
                              ))}
                            </select>
                            {errors[`item-${index}-ledger`] && (
                              <p className="text-destructive text-xs mt-1">
                                {errors[`item-${index}-ledger`]}
                              </p>
                            )}
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={item.amount}
                              onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                              className={cn(
                                "text-right font-mono",
                                errors[`item-${index}-amount`] && "border-destructive"
                              )}
                            />
                            {errors[`item-${index}-amount`] && (
                              <p className="text-destructive text-xs mt-1 text-right">
                                {errors[`item-${index}-amount`]}
                              </p>
                            )}
                          </td>
                          <td className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(item.id)}
                              disabled={items.length <= 2}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {errors.items && (
                <p className="text-destructive text-sm mt-2">{errors.items}</p>
              )}
              
              {errors.balance && (
                <p className="text-destructive text-sm mt-2">{errors.balance}</p>
              )}
            </div>
            
            {/* Total */}
            <div className="flex items-center justify-end gap-4 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Total Amount:</span>
              <span className="text-2xl font-bold font-mono text-foreground">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            {/* Narration */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Narration
              </label>
              <textarea
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Enter narration..."
                className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
              />
            </div>
          </div>
        </form>
        
        {/* Footer Actions */}
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calculator size={14} /> Calculator
            </span>
            <span>F2: Date</span>
            <span>Ctrl+A: Accept</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }} className="gap-2">
              <Save size={16} /> Save Voucher
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}