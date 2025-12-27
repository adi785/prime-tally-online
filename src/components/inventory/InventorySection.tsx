import { useState } from 'react';
import { useStockItems, useCreateStockItem, useUpdateStockItem, useDeleteStockItem } from '@/integrations/supabase/hooks';
import { cn } from '@/lib/utils';
import { Search, Plus, Filter, Download, Package, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function InventorySection() {
  const { data: stockItems = [], isLoading, error } = useStockItems();
  const { mutate: createStockItem, isPending: isCreating } = useCreateStockItem();
  const { mutate: updateStockItem, isPending: isUpdating } = useUpdateStockItem();
  const { mutate: deleteStockItem, isPending: isDeleting } = useDeleteStockItem();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || item.group_name === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const totalValue = filteredItems.reduce((sum, item) => sum + item.value, 0);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const groups = Array.from(new Set(stockItems.map(s => s.group_name)));

  const handleCreateItem = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = (item: any) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      deleteStockItem(item.id);
    }
  };

  const handleSaveItem = (itemData: any) => {
    if (editingItem) {
      updateStockItem({ id: editingItem.id, ...itemData });
    } else {
      createStockItem(itemData);
    }
    setIsFormOpen(false);
  };

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <div className="text-destructive mb-4">
            <AlertCircle size={32} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Inventory</h3>
          <p className="text-muted-foreground">Failed to load stock items. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Stock items and valuations</p>
        </div>
        <Button className="gap-2" onClick={handleCreateItem} disabled={isCreating}>
          <Plus size={16} />
          {isCreating ? 'Adding...' : 'Add Stock Item'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-xl font-bold">{stockItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock Value</p>
              <p className="text-xl font-bold font-mono">{formatAmount(totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10 text-warning">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Groups</p>
              <p className="text-xl font-bold">{groups.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 animate-fade-in">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search stock items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="h-10 px-4 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Groups</option>
          {groups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>

        <Button variant="outline" size="icon">
          <Filter size={16} />
        </Button>
        <Button variant="outline" size="icon">
          <Download size={16} />
        </Button>
      </div>

      {/* Stock Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="bg-table-header border-b border-table-border">
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Item Name</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Group</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">Unit</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Quantity</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Rate</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Value</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-foreground w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                  </div>
                  <p className="text-muted-foreground">No stock items found.</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first stock item to get started.</p>
                  <Button variant="outline" className="mt-4" onClick={handleCreateItem}>
                    Add First Item
                  </Button>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => (
                <tr 
                  key={item.id}
                  className="hover:bg-table-row-hover transition-colors cursor-pointer animate-slide-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{item.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{item.group_name}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-muted-foreground">{item.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "font-mono text-sm",
                      item.quantity < 100 ? "text-warning font-semibold" : "text-foreground"
                    )}>
                      {item.quantity.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm text-muted-foreground">
                      {formatAmount(item.rate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {formatAmount(item.value)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        title="Edit Item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(item);
                        }}
                        disabled={isUpdating}
                      >
                        <span className="text-xs">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                        title="Delete Item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item);
                        }}
                        disabled={isDeleting}
                      >
                        <span className="text-xs">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-muted/50 border-t border-table-border">
              <td colSpan={5} className="px-4 py-3 text-right font-semibold text-foreground">
                Total Stock Value:
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-mono text-lg font-bold text-foreground">
                  {formatAmount(totalValue)}
                </span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Stock Item Form Modal */}
      {isFormOpen && (
        <StockItemForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          item={editingItem}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}

// Stock Item Form Component
interface StockItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
  onSave: (itemData: any) => void;
}

function StockItemForm({ isOpen, onClose, item, onSave }: StockItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    unit: item?.unit || '',
    quantity: item?.quantity?.toString() || '0',
    rate: item?.rate?.toString() || '0',
    group_name: item?.group_name || 'Raw Materials',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      newErrors.rate = 'Rate must be greater than 0';
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
      const itemData = {
        name: formData.name.trim(),
        unit: formData.unit.trim(),
        quantity: parseFloat(formData.quantity),
        rate: parseFloat(formData.rate),
        value: parseFloat(formData.quantity) * parseFloat(formData.rate),
        group_name: formData.group_name,
      };

      onSave(itemData);
      
      toast.success(item ? "Stock Item Updated" : "Stock Item Created", {
        description: `${formData.name} has been ${item ? 'updated' : 'created'} successfully`,
      });
      
      handleClose();
    } catch (error: any) {
      console.error('Error saving stock item:', error);
      toast.error("Error", {
        description: error.message || "Failed to save stock item. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      unit: '',
      quantity: '0',
      rate: '0',
      group_name: 'Raw Materials',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {item ? 'Edit Stock Item' : 'Add Stock Item'}
          </h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50" disabled={isSubmitting}>
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input 
              id="name" 
              placeholder="Enter item name" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              className={errors.name ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input 
                id="unit" 
                placeholder="e.g., Kg, Nos, Mtr" 
                value={formData.unit} 
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
                className={errors.unit ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.unit && (
                <p className="text-sm text-destructive">{errors.unit}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="group">Group</Label>
              <select
                value={formData.group_name}
                onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm disabled:opacity-50"
                disabled={isSubmitting}
              >
                <option value="Raw Materials">Raw Materials</option>
                <option value="Finished Goods">Finished Goods</option>
                <option value="Consumables">Consumables</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                placeholder="0" 
                value={formData.quantity} 
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} 
                className={errors.quantity ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate (₹)</Label>
              <Input 
                id="rate" 
                type="number" 
                placeholder="0.00" 
                value={formData.rate} 
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })} 
                className={errors.rate ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.rate && (
                <p className="text-sm text-destructive">{errors.rate}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Value: <span className="font-mono font-semibold">{formatAmount(parseFloat(formData.quantity) * parseFloat(formData.rate))}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose} type="button" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};