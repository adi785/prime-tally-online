import { useState } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useLedgerGroups } from '@/integrations/supabase/hooks'
import { useCreateLedger, useUpdateLedger } from '@/integrations/supabase/hooks'

interface LedgerFormProps {
  isOpen: boolean
  onClose: () => void
  ledger?: any | null
  onSave: () => void
}

const groupOptions = [
  { value: 'sundry-debtors', label: 'Sundry Debtors' },
  { value: 'sundry-creditors', label: 'Sundry Creditors' },
  { value: 'bank-accounts', label: 'Bank Accounts' },
  { value: 'cash-in-hand', label: 'Cash-in-Hand' },
  { value: 'sales-accounts', label: 'Sales Accounts' },
  { value: 'purchase-accounts', label: 'Purchase Accounts' },
  { value: 'direct-expenses', label: 'Direct Expenses' },
  { value: 'indirect-expenses', label: 'Indirect Expenses' },
  { value: 'direct-incomes', label: 'Direct Incomes' },
  { value: 'indirect-incomes', label: 'Indirect Incomes' },
  { value: 'fixed-assets', label: 'Fixed Assets' },
  { value: 'current-assets', label: 'Current Assets' },
  { value: 'current-liabilities', label: 'Current Liabilities' },
  { value: 'capital-account', label: 'Capital Account' },
]

export function LedgerForm({ isOpen, onClose, ledger, onSave }: LedgerFormProps) {
  const { data: groups = [] } = useLedgerGroups()
  const { mutate: createLedger, isPending: isCreating } = useCreateLedger()
  const { mutate: updateLedger, isPending: isUpdating } = useUpdateLedger()
  
  const [formData, setFormData] = useState({
    name: ledger?.name || '',
    group_id: ledger?.group_id || '',
    opening_balance: ledger?.opening_balance?.toString() || '0',
    address: ledger?.address || '',
    phone: ledger?.phone || '',
    gstin: ledger?.gstin || '',
    email: ledger?.email || '',
    is_billwise: ledger?.is_billwise || false,
    is_inventory: ledger?.is_inventory || false,
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Ledger name is required'
    }
    if (!formData.group_id) {
      newErrors.group_id = 'Group is required'
    }
    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(formData.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format'
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid Indian phone number'
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
      const ledgerData = {
        name: formData.name.trim(),
        group_id: formData.group_id,
        opening_balance: parseFloat(formData.opening_balance) || 0,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        gstin: formData.gstin.trim(),
        email: formData.email.trim(),
        is_billwise: formData.isBillwise,
        is_inventory: formData.isInventory,
      }
      
      if (ledger) {
        updateLedger({ id: ledger.id, ...ledgerData })
      } else {
        createLedger(ledgerData)
      }
      
      toast.success(ledger ? "Ledger Updated" : "Ledger Created", {
        description: `${formData.name} has been ${ledger ? 'updated' : 'created'} successfully`,
      })
      
      onSave()
      handleClose()
    } catch (error: any) {
      console.error('Error saving ledger:', error)
      toast.error("Error", {
        description: error.message || "Failed to save ledger. Please try again.",
      })
    }
  }
  
  const handleClose = () => {
    setFormData({
      name: '',
      group_id: '',
      opening_balance: '0',
      address: '',
      phone: '',
      gstin: '',
      email: '',
      is_billwise: false,
      is_inventory: false,
    })
    setErrors({})
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-2xl h-[90vh] rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {ledger ? 'Edit Ledger' : 'Create New Ledger'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {ledger ? 'Update ledger details' : 'Add a new ledger account'}
              </p>
            </div>
            <button 
              onClick={handleClose} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto tally-scrollbar">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ledger Name *</Label>
              <Input 
                id="name" 
                placeholder="Enter ledger name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="group_id">Group *</Label>
              <Select 
                value={formData.group_id} 
                onValueChange={(value) => setFormData({ ...formData, group_id: value })}
              >
                <SelectTrigger className={errors.group_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group: any) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.group_id && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.group_id}
                </p>
              )}
            </div>
          </div>
          
          {/* Financial Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Opening Balance (₹)</Label>
              <Input 
                id="openingBalance" 
                type="number" 
                placeholder="0.00" 
                value={formData.opening_balance}
                onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Positive for Dr (Debit), Negative for Cr (Credit)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input 
                id="gstin" 
                placeholder="27AABCU9603R1ZM" 
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className={errors.gstin ? "border-destructive" : ""}
                maxLength={15}
              />
              {errors.gstin && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.gstin}
                </p>
              )}
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  placeholder="+91 9876543210" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="contact@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                placeholder="Enter complete address" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          
          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Options</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Enable Bill-wise Details</p>
                  <p className="text-sm text-muted-foreground">Track bills and invoices</p>
                </div>
                <Switch 
                  checked={formData.is_billwise} 
                  onCheckedChange={(checked) => setFormData({ ...formData, is_billwise: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Enable Inventory</p>
                  <p className="text-sm text-muted-foreground">Track stock and quantities</p>
                </div>
                <Switch 
                  checked={formData.is_inventory} 
                  onCheckedChange={(checked) => setFormData({ ...formData, is_inventory: checked })}
                />
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {ledger ? 'Last updated: Today' : 'All fields marked with * are required'}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose} type="button">
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={isCreating || isUpdating}>
                <Save size={16} />
                {isCreating || isUpdating ? 'Saving...' : ledger ? 'Update Ledger' : 'Create Ledger'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}