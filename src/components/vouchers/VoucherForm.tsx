import { useState } from 'react';
import { X, Save, Plus, Trash2, Calculator, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { VoucherType, Ledger, LedgerGroup } from '@/types/tally';
import { useLedgers } from '@/integrations/supabase/hooks';
import { useCreateVoucher, useUpdateVoucher } from '@/integrations/supabase/hooks';
import { toast } from 'sonner';

interface VoucherFormProps {
  type: VoucherType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (voucherData: any) => void;
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
  type: 'debit' | 'credit';
}

export function VoucherForm({ type, isOpen, onClose, onSave }: VoucherFormProps) {
  const { toast: showToast } = useToast();
  const { data: ledgers = [], isLoading } = useLedgers();
  const { mutate: createVoucher, isPending: isCreating } = useCreateVoucher();
  const { mutate: updateVoucher, isPending: isUpdating } = useUpdateVoucher();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [voucherNumber, setVoucherNumber] = useState('');
  const [partyLedger, setPartyLedger] = useState('');
  const [narration, setNarration] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', ledgerId: '', amount: '', type: 'debit' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = voucherConfig[type];

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), ledgerId: '', amount: '', type: 'debit' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
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

  const getVoucherTypeOptions = () => {
    switch (type) {
      case 'sales':
        return [
          { value: 'debit', label: 'Debit Party Account' },
          { value: 'credit', label: 'Credit Sales Account' }
        ];
      case 'purchase':
        return [
          { value: 'debit', label: 'Debit Purchase Account' },
          { value: 'credit', label: 'Credit Party Account' }
        ];
      case 'receipt':
        return [
          { value: 'debit', label: 'Debit Bank/Cash Account' },
          { value: 'credit', label: 'Credit Party Account' }
        ];
      case 'payment':
        return [
          { value: 'debit', label: 'Debit Party Account' },
          { value: 'credit', label: 'Credit Bank/Cash Account' }
        ];
      default:
        return [
          { value: 'debit', label: 'Debit Account' },
          { value: 'credit', label: 'Credit Account' }
        ];
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!date) {
      newErrors.date = 'Date is required';
    }

    if (!partyLedger) {
      newErrors.partyLedger = 'Party account is required';
    }

    const validItems = items.filter(item => item.ledgerId && item.amount);
    if (validItems.length === 0) {
      newErrors.items = 'At least one ledger entry is required';
    }

    const totalDebit = items.filter(item => item.type === 'debit').reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalCredit = items.filter(item => item.type === 'credit').reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      newErrors.balance = 'Debit and Credit amounts must be equal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const voucherData = {
        type_id: type, // Use type_id instead of type
        date,
        voucher_number: voucherNumber || `AUTO-${Date.now()}`,
        party_ledger_id: partyLedger,
        narration,
        items: items.filter(item => item.ledgerId && item.amount).map(item => ({
          ledger_id: item.ledgerId,
          amount: parseFloat(item.amount),
          type: item.type
        })),
        total_amount: totalAmount,
      };

      if (voucherData.items.length === 0) {
        throw new Error('At least one ledger entry is required');
      }

      if (voucherData.items.length < 2) {
        throw new Error('Voucher must have at least one debit and one credit entry');
      }

      onSave(voucherData);
      
      toast.success("Voucher Created", {
        description: `${voucherConfig[type].title} has been created successfully`,
      });

      handleClose();
    } catch (error: any) {
      console.error('Error saving voucher:', error);
      toast.error("Error", {
        description: error.message || "Failed to save voucher. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setVoucherNumber('');
    setPartyLedger('');
    setNarration('');
    setItems([{ id: '1', ledgerId: '', amount: '', type: 'debit' }]);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className={cn(
          "px-6 py-4 flex items-center justify-between",
          config.bgColor
        )}>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">{config.title}</h2>
            <span className="text-white/70 text-sm">F8</span>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors disabled:opacity-50" disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto tally-scrollbar">
          {/* Basic Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
              {errors.date && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.date}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="voucherNumber">Voucher No.</Label>
              <Input 
                id="voucherNumber"
                placeholder="Auto-generate"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partyLedger">Party Account</Label>
              <Select
                value={partyLedger}
                onValueChange={setPartyLedger}
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select Party"} />
                </SelectTrigger>
                <SelectContent>
                  {partyLedgers.map(ledger => (
                    <SelectItem key={ledger.id} value={ledger.id}>
                      {ledger.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.partyLedger && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.partyLedger}
                </p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Particulars</Label>
              <Button variant="outline" size="sm" onClick={addItem} className="gap-1" disabled={isSubmitting}>
                <Plus size={14} />
                Add Row
              </Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground w-48">Type</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Account</th>
                    <th className="text-right px-4 py-2 text-sm font-medium text-muted-foreground w-40">Amount</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="p-2">
                        <Select
                          value={item.type}
                          onValueChange={(value) => updateItem(item.id, 'type', value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getVoucherTypeOptions().map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={item.ledgerId}
                          onValueChange={(value) => updateItem(item.id, 'ledgerId', value)}
                          disabled={isSubmitting || isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Loading..." : "Select Account"} />
                          </SelectTrigger>
                          <SelectContent>
                            {accountLedgers.map(ledger => (
                              <SelectItem key={ledger.id} value={ledger.id}>
                                {ledger.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                          className="text-right font-mono"
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="p-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-50"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1 || isSubmitting}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.items && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                <AlertCircle size={12} />
                {errors.items}
              </p>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-end gap-4 p-4 bg-muted rounded-lg">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Debit:</p>
              <p className="text-sm text-muted-foreground">Total Credit:</p>
              <p className="text-sm font-medium text-foreground mt-2">Balance:</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono text-foreground">
                ₹{items.filter(i => i.type === 'debit').reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0).toLocaleString('en-IN')}
              </p>
              <p className="text-sm font-mono text-foreground">
                ₹{items.filter(i => i.type === 'credit').reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0).toLocaleString('en-IN')}
              </p>
              <p className="text-lg font-bold font-mono text-foreground mt-2">
                ₹{Math.abs(
                  items.filter(i => i.type === 'debit').reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0) -
                  items.filter(i => i.type === 'credit').reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)
                ).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Narration */}
          <div className="space-y-2">
            <Label htmlFor="narration">Narration</Label>
            <Textarea
              id="narration"
              placeholder="Enter narration..."
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calculator size={14} />
                Calculator
              </span>
              <span>F2: Date</span>
              <span>Ctrl+A: Accept</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose} type="button" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={isSubmitting}>
                <Save size={16} />
                {isSubmitting ? 'Saving...' : 'Save Voucher'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}