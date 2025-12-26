import { useState } from 'react';
import { X, Plus, Trash2, Save, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoucherType } from '@/types/tally';
import { ledgers } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface VoucherModalProps {
  type: VoucherType;
  isOpen: boolean;
  onClose: () => void;
}

const voucherConfig: Record<VoucherType, { title: string; color: string; bgColor: string }> = {
  sales: { title: 'Sales Voucher', color: 'text-success', bgColor: 'bg-success' },
  purchase: { title: 'Purchase Voucher', color: 'text-warning', bgColor: 'bg-warning' },
  receipt: { title: 'Receipt Voucher', color: 'text-tally-blue', bgColor: 'bg-tally-blue' },
  payment: { title: 'Payment Voucher', color: 'text-destructive', bgColor: 'bg-destructive' },
  journal: { title: 'Journal Voucher', color: 'text-tally-purple', bgColor: 'bg-tally-purple' },
  contra: { title: 'Contra Voucher', color: 'text-muted-foreground', bgColor: 'bg-muted-foreground' },
  'credit-note': { title: 'Credit Note', color: 'text-success', bgColor: 'bg-success' },
  'debit-note': { title: 'Debit Note', color: 'text-warning', bgColor: 'bg-warning' },
};

interface LineItem {
  id: string;
  ledgerId: string;
  amount: string;
}

export function VoucherModal({ type, isOpen, onClose }: VoucherModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [voucherNumber, setVoucherNumber] = useState('');
  const [partyLedger, setPartyLedger] = useState('');
  const [narration, setNarration] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', ledgerId: '', amount: '' }
  ]);

  const config = voucherConfig[type];

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), ledgerId: '', amount: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const partyLedgers = ledgers.filter(l => 
    ['sundry-debtors', 'sundry-creditors'].includes(l.group)
  );

  const accountLedgers = ledgers.filter(l => 
    !['sundry-debtors', 'sundry-creditors'].includes(l.group)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className={cn(
          "px-6 py-4 flex items-center justify-between",
          config.bgColor
        )}>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">{config.title}</h2>
            <span className="text-white/70 text-sm">F8</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto tally-scrollbar">
          {/* Basic Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Date</label>
              <Input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Voucher No.</label>
              <Input 
                placeholder="Auto-generate"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Party Account</label>
              <select
                value={partyLedger}
                onChange={(e) => setPartyLedger(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Select Party</option>
                {partyLedgers.map(ledger => (
                  <option key={ledger.id} value={ledger.id}>{ledger.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Particulars</label>
              <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus size={14} />
                Add Row
              </Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Account</th>
                    <th className="text-right px-4 py-2 text-sm font-medium text-muted-foreground w-40">Amount</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-border last:border-b-0">
                      <td className="p-2">
                        <select
                          value={item.ledgerId}
                          onChange={(e) => updateItem(item.id, 'ledgerId', e.target.value)}
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Select Account</option>
                          {accountLedgers.map(ledger => (
                            <option key={ledger.id} value={ledger.id}>{ledger.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                          className="text-right font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Narration</label>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Enter narration..."
              className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calculator size={14} />
              Calculator
            </span>
            <span>F2: Date</span>
            <span>Ctrl+A: Accept</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="gap-2">
              <Save size={16} />
              Save Voucher
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
