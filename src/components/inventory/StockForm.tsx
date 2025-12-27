import { useState } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useCreateStockItem, useUpdateStockItem } from '@/integrations/supabase/hooks'

interface StockFormProps {
  isOpen: boolean
  onClose: () => void
  item?: any | null
  onSave: () => void
}

export function StockForm({ isOpen, onClose, item, onSave }: StockFormProps) {
  const { mutate: createStockItem, isPending: isCreating } = useCreateStockItem()
  const { mutate: updateStockItem, isPending: isUpdating } = useUpdateStockItem()
  
  const [formData, setFormData] = useState({
    name: item?.name || '',
    unit: item?.unit || '',
    quantity: item?.quantity?.toString() || '0',
    rate: item?.rate?.toString() || '0',
    group_name: item?.group_name || 'Raw Materials',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required'
    }
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required'
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      newErrors.rate = 'Rate must be greater than 0'
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
      const itemData = {
        name: formData.name.trim(),
        unit: formData.unit.trim(),
        quantity: parseFloat(formData.quantity),
        rate: parseFloat(formData.rate),
        value: parseFloat(formData.quantity) * parseFloat(formData.rate),
        group_name: formData.group_name,
      }
      
      if (item) {
        updateStockItem({ id: item.id, ...itemData })
      } else {
        createStockItem(itemData)
      }
      
      toast.success(item ? "Stock Item Updated" : "Stock Item Created", {
        description: `${formData.name} has been ${item ? 'updated' : 'created'} successfully`,
      })
      
      onSave()
      handleClose()
    } catch (error: any) {
      console.error('Error saving stock item:', error)
      toast.error("Error", {
        description: error.message || "Failed to save stock item. Please try again.",
      })
    }
  }
  
  const handleClose = () => {
    setFormData({
      name: '',
      unit: '',
      quantity: '0',
      rate: '0',
      group_name: 'Raw Materials',
    })
    setErrors({})
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {item ? 'Edit Stock Item' : 'Add Stock Item'}
          </h2>
          <button 
            onClick={handleClose} 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input 
              id="name" 
              placeholder="Enter item name" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input 
                id="unit" 
                placeholder="e.g., Kg, Nos, Mtr" 
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className={errors.unit ? "border-destructive" : ""}
              />
              {errors.unit && (
                <p className="text-sm text-destructive">{errors.unit}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="group">Group</Label>
              <Select 
                value={formData.group_name} 
                onValueChange={(value) => setFormData({ ...formData, group_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                  <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                  <SelectItem value="Packaging">Packaging</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input 
                id="quantity" 
                type="number" 
                placeholder="0" 
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={errors.quantity ? "border-destructive" : ""}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate (₹) *</Label>
              <Input 
                id="rate" 
                type="number" 
                placeholder="0.00" 
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                className={errors.rate ? "border-destructive" : ""}
              />
              {errors.rate && (
                <p className="text-sm text-destructive">{errors.rate}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Value: <span className="font-mono font-semibold">
                ₹{(parseFloat(formData.quantity) * parseFloat(formData.rate)).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}