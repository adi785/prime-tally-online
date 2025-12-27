import { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, Calculator, Calendar, AlertCircle, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useLedgers, useVoucherTypes } from '@/integrations/supabase/hooks'
import { useCreateVoucher, useUpdateVoucher } from '@/integrations/supabase/hooks'
import { Ledger, Voucher } from '@/integrations/supabase/types'

interface VoucherFormProps {
  type: string
  isOpen: boolean
  onClose: () => void
  onSave: (voucherData?: any) => void
  voucher?: Voucher | null // Optional voucher prop for editing
}

const voucherConfig: Record<string, { title: string; color: string; bgColor: string }> = {
  sales: { title: 'Sales Voucher', color: 'text-success', bgColor: 'bg-success' },
  purchase: { title: 'Purchase Voucher', color: 'text-warning', bgColor: 'bg-warning' },
  receipt: { title: 'Receipt Voucher', color: 'text-tally-blue', bgColor: 'bg-tally-blue' },
  payment: { title: 'Payment Voucher', color: 'text-destructive', bgColor: 'bg-destructive' },
  journal: { title: 'Journal Voucher', color: 'text-tally-purple', bgColor: 'bg-tally-purple' },
  contra: { title: 'Contra Voucher', color: 'text-muted-foreground', bgColor: 'bg-muted-foreground' },
  'credit-note': { title: 'Credit Note', color: 'text-success', bgColor: 'bg-success' },
  'debit-note': { title: 'Debit Note', color: 'text-warning', bgColor: 'bg-warning' },
}

interface LineItem {
  id: string
  ledgerId: string
  amount: string
  type: 'debit' | 'credit'
  description?: string
}

export function VoucherForm({ type, isOpen, onClose, onSave, voucher }: VoucherFormProps) {
  const { data: ledgers = [], isLoading: isLedgersLoading } = useLedgers()
  const { data: voucherTypes = [] } = useVoucherTypes()
  const { mutate: createVoucher, isPending: isCreating } = useCreateVoucher()
  const { mutate: updateVoucher, isPending: isUpdating } = useUpdateVoucher()
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [voucherNumber, setVoucherNumber] = useState('')
  const [partyLedgerId, setPartyLedgerId] = useState('')
  const [narration, setNarration] = useState('')
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', ledgerId: '', amount: '', type: 'debit' }
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const config = voucherConfig[type]

  useEffect(() => {
    if (voucher) {
      setDate(voucher.date || new Date().toISOString().split('T')[0]);
      setVoucherNumber(voucher.voucher_number || '');
      setPartyLedgerId(voucher.party_ledger_id || '');
      setNarration(voucher.narration || '');
      setItems(voucher.items.map(item => ({
        id: item.id,
        ledgerId: item.ledger_id,
        amount: item.amount.toString(),
        type: item.type,
        description: item.particulars || ''
      })));
    } else {
      // Reset form for new voucher
      setDate(new Date().toISOString().split('T')[0]);
      setVoucherNumber('');
      setPartyLedgerId('');
      setNarration('');
      setItems([{ id: '1', ledgerId: '', amount: '', type: 'debit' }]);
    }
    setErrors({}); // Clear errors on voucher change
  }, [voucher, type]);
  
  // Filter ledgers based on voucher type
  const partyLedgers = ledgers.filter(l => 
    ['Sundry Debtors', 'Sundry Creditors'].includes(l.group?.name || l.group_name || '')
  )
  
  const accountLedgers = ledgers.filter(l => 
    !['Sundry Debtors', 'Sundry Creditors'].includes(l.group?.name || l.group_name || '')
  )
  
  const getVoucherTypeOptions = (itemType: 'debit' | 'credit') => {
    let filteredLedgers: Ledger[] = [];
    let label = '';

    switch (type) {
      case 'sales':
        if (itemType === 'debit') {
          label = 'Debit Party Account (Sundry Debtors)';
          filteredLedgers = ledgers.filter(l => l.group?.name === 'Sundry Debtors');
        } else {
          label = 'Credit Sales Account';
          filteredLedgers = ledgers.filter(l => l.group?.name === 'Sales Accounts');
        }
        break;
      case 'purchase':
        if (itemType === 'debit') {
          label = 'Debit Purchase Account';
          filteredLedgers = ledgers.filter(l => l.group?.name === 'Purchase Accounts');
        } else {
          label = 'Credit Party Account (Sundry Creditors)';
          filteredLedgers = ledgers.filter(l => l.group?.name === 'Sundry Creditors');
        }
        break;
      case 'receipt':
        if (itemType === 'debit') {
          label = 'Debit Bank/Cash Account';
          filteredLedgers = ledgers.filter(l => ['Bank Accounts', 'Cash-in-Hand'].includes(l.group?.name || ''));
        } else {
          label = 'Credit Party Account (Sundry Debtors)';
          filteredLedgers = ledgers.filter(l => l.group?.name === 'Sundry Debtors');
        }
        break;
      case 'payment':
        if (itemType === 'debit') {
          label = 'Debit Party Account (Sundry Creditors)';
          filteredLedgers = ledgers.filter(l => l.group?.name === 'Sundry Creditors');
        } else {
          label = 'Credit Bank/Cash Account';
          filteredLedgers = ledgers.filter(l => ['Bank Accounts', 'Cash-in-Hand'].includes(l.group?.name || ''));
        }
        break;
      case 'journal':
      case 'contra':
      default:
        label = itemType === 'debit' ? 'Debit Account' : 'Credit Account';
        filteredLedgers = accountLedgers; // All non-party ledgers
        break;
    }
    return { label, accounts: filteredLedgers };
  };
  
  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), ledgerId: '', amount: '', type: 'debit' }])
  }
  
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }
  
  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }
  
  const totalDebit = items.filter(item => item.type === 'debit')
    .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  const totalCredit = items.filter(item => item.type === 'credit')
    .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!date) {
      newErrors.date = 'Date is required'
    }
    
    if (!partyLedgerId && !['journal', 'contra'].includes(type)) { // Party ledger not required for Journal/Contra
      newErrors.partyLedger = 'Party account is required'
    }
    
    const validItems = items.filter(item => item.ledgerId && item.amount)
    if (validItems.length === 0) {
      newErrors.items = 'At least one ledger entry is required'
    }
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      newErrors.balance = 'Debit and Credit amounts must be equal'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form",
      })
      return
    }
    
    try {
      // Find the voucher type ID
      const selectedVoucherType = voucherTypes.find((vt: any) => vt.name === type)
      if (!selectedVoucherType) {
        throw new Error('Voucher type not found');
      }
      
      const voucherData = {
        voucher_number: voucherNumber || `AUTO-${Date.now()}`,
        type_id: selectedVoucherType.id,
        date,
        party_ledger_id: partyLedgerId || null, // Can be null for Journal/Contra
        narration,
        items: items
          .filter(item => item.ledgerId && item.amount)
          .map(item => ({
            ledger_id: item.ledgerId,
            amount: parseFloat(item.amount),
            type: item.type
          })),
        total_amount: totalDebit, // Total amount is sum of debits (or credits)
      }
      
      if (voucherData.items.length === 0) {
        throw new Error('At least one ledger entry is required')
      }
      
      if (voucher) {
        await updateVoucher({ id: voucher.id, ...voucherData });
      } else {
        await createVoucher(voucherData);
      }

      toast.success(voucher ? "Voucher Updated" : "Voucher Created", {
        description: `${config.title} has been ${voucher ? 'updated' : 'created'} successfully`,
      })
      
      onSave()
      handleClose()
    } catch (error: any) {
      console.error('Error saving voucher:', error)
      toast.error("Error", {
        description: error.message || "Failed to save voucher. Please try again.",
      })
    }
  }
  
  const handleClose = () => {
    setDate(new Date().toISOString().split('T')[0])
    setVoucherNumber('')
    setPartyLedgerId('')
    setNarration('')
    setItems([{ id: '1', ledgerId: '', amount: '', type: 'debit' }])
    setErrors({})
    onClose()
  }
  
  if (!isOpen) return null
  
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
          <button 
            onClick={handleClose} 
            className="text-white/70 hover:text-white transition-colors"
            disabled={isCreating || isUpdating}
          >
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
                  disabled={isCreating || isUpdating}
                />
              </div>
              {errors.date && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.date}
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
                disabled={isCreating || isUpdating}
              />
            </div>
            { !['journal', 'contra'].includes(type) && (
              <div className="space-y-2">
                <Label htmlFor="partyLedger">Party Account</Label>
                <Select 
                  value={partyLedgerId} 
                  onValueChange={setPartyLedgerId}
                  disabled={isLedgersLoading || isCreating || isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLedgersLoading ? "Loading..." : "Select Party"} />
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
                    <AlertCircle size={12} /> {errors.partyLedger}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Particulars</Label>
              <Button variant="outline" size="sm" onClick={addItem} className="gap-1" disabled={isCreating || isUpdating}>
                <PlusCircle size={14} /> Add Row
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
                          onValueChange={(value) => updateItem(item.id, 'type', value as 'debit' | 'credit')}
                          disabled={isCreating || isUpdating}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debit">{getVoucherTypeOptions('debit').label}</SelectItem>
                            <SelectItem value="credit">{getVoucherTypeOptions('credit').label}</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select 
                          value={item.ledgerId} 
                          onValueChange={(value) => updateItem(item.id, 'ledgerId', value)}
                          disabled={isLedgersLoading || isCreating || isUpdating}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isLedgersLoading ? "Loading..." : "Select Account"} />
                          </SelectTrigger>
                          <SelectContent>
                            {getVoucherTypeOptions(item.type).accounts
                              .map(ledger => (
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
                          disabled={isCreating || isUpdating}
                        />
                      </td>
                      <td className="p-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1 || isCreating || isUpdating}
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
                <AlertCircle size={12} /> {errors.items}
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
                ₹{totalDebit.toLocaleString('en-IN')}
              </p>
              <p className="text-sm font-mono text-foreground">
                ₹{totalCredit.toLocaleString('en-IN')}
              </p>
              <p className={cn(
                "text-lg font-bold font-mono mt-2",
                Math.abs(totalDebit - totalCredit) < 0.01 ? "text-success" : "text-destructive"
              )}>
                ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}
              </p>
            </div>
          </div>
          {errors.balance && (
            <p className="text-sm text-destructive flex items-center gap-1 mt-2">
              <AlertCircle size={12} /> {errors.balance}
            </p>
          )}
          
          {/* Narration */}
          <div className="space-y-2">
            <Label htmlFor="narration">Narration</Label>
            <Textarea 
              id="narration" 
              placeholder="Enter narration..." 
              value={narration} 
              onChange={(e) => setNarration(e.target.value)} 
              rows={3}
              disabled={isCreating || isUpdating}
            />
          </div>
          
          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calculator size={14} /> Calculator
              </span>
              <span>F2: Date</span>
              <span>Ctrl+A: Accept</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose} type="button" disabled={isCreating || isUpdating}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={isCreating || isUpdating}>
                <Save size={16} />
                {isCreating || isUpdating ? 'Saving...' : voucher ? 'Update Voucher' : 'Save Voucher'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}