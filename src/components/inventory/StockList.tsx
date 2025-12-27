import { useState } from 'react'
import { useStockItems, useCreateStockItem, useUpdateStockItem, useDeleteStockItem } from '@/integrations/supabase/hooks'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { StockForm } from './StockForm'

export function StockList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { data: stockItems = [], isLoading } = useStockItems()
  const { mutate: createStockItem } = useCreateStockItem()
  const { mutate: updateStockItem } = useUpdateStockItem()
  const { mutate: deleteStockItem } = useDeleteStockItem()

  const filteredItems = stockItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this stock item?')) {
      deleteStockItem(id)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleSave = () => {
    setIsFormOpen(false)
    setEditingItem(null)
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Manage your stock items</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus size={16} /> Add Stock Item
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search stock items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10" 
          />
        </div>
      </div>
      
      {/* Stock Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header border-b border-table-border">
              <TableHead className="text-left px-4 py-3 text-sm font-semibold text-foreground">Item Name</TableHead>
              <TableHead className="text-left px-4 py-3 text-sm font-semibold text-foreground">Group</TableHead>
              <TableHead className="text-center px-4 py-3 text-sm font-semibold text-foreground">Unit</TableHead>
              <TableHead className="text-right px-4 py-3 text-sm font-semibold text-foreground">Quantity</TableHead>
              <TableHead className="text-right px-4 py-3 text-sm font-semibold text-foreground">Rate</TableHead>
              <TableHead className="text-right px-4 py-3 text-sm font-semibold text-foreground">Value</TableHead>
              <TableHead className="text-center px-4 py-3 text-sm font-semibold text-foreground w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-table-border">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="p-8 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Plus size={32} className="mx-auto mb-2 opacity-50" />
                  </div>
                  <p className="text-muted-foreground">No stock items found.</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first stock item to get started.</p>
                  <Button variant="outline" className="mt-4" onClick={handleCreate}>
                    Add First Item
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-table-row-hover transition-colors">
                  <TableCell className="px-4 py-3">
                    <p className="font-medium text-foreground">{item.name}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{item.group_name}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <span className="text-sm text-muted-foreground">{item.unit}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="font-mono text-sm text-foreground">
                      {item.quantity.toLocaleString('en-IN')}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="font-mono text-sm text-muted-foreground">
                      {formatAmount(item.rate)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {formatAmount(item.value)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Stock Form Modal */}
      {isFormOpen && (
        <StockForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          item={editingItem}
          onSave={handleSave}
        />
      )}
    </div>
  )
}