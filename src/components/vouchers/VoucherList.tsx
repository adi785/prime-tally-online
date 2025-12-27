import { useState } from 'react'
import { useVouchers, useCreateVoucher, useUpdateVoucher, useDeleteVoucher } from '@/integrations/supabase/hooks'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { VoucherForm } from './VoucherForm'

export function VoucherList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [voucherType, setVoucherType] = useState('sales')
  const { data: vouchers = [], isLoading } = useVouchers()
  const { mutate: createVoucher } = useCreateVoucher()
  const { mutate: updateVoucher } = useUpdateVoucher()
  const { mutate: deleteVoucher } = useDeleteVoucher()
  const navigate = useNavigate()

  const filteredVouchers = vouchers.filter(voucher => 
    voucher.party_ledger?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      deleteVoucher(id)
    }
  }

  const handleCreate = (type: string) => {
    setVoucherType(type)
    setIsFormOpen(true)
  }

  const handleSaveVoucher = (voucherData: any) => {
    createVoucher(voucherData)
    setIsFormOpen(false)
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vouchers</h1>
          <p className="text-muted-foreground">Manage your voucher entries</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={() => handleCreate('sales')}>
            <Plus size={16} /> Sales Voucher
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleCreate('purchase')}>
            <Plus size={16} /> Purchase Voucher
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search vouchers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10" 
          />
        </div>
      </div>
      
      {/* Voucher Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header border-b border-table-border">
              <TableHead className="text-left px-4 py-3 text-sm font-semibold text-foreground">Voucher No.</TableHead>
              <TableHead className="text-left px-4 py-3 text-sm font-semibold text-foreground">Type</TableHead>
              <TableHead className="text-left px-4 py-3 text-sm font-semibold text-foreground">Party</TableHead>
              <TableHead className="text-left px-4 py-3 text-sm font-semibold text-foreground">Date</TableHead>
              <TableHead className="text-right px-4 py-3 text-sm font-semibold text-foreground">Amount</TableHead>
              <TableHead className="text-center px-4 py-3 text-sm font-semibold text-foreground w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-table-border">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="p-8 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredVouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Plus size={32} className="mx-auto mb-2 opacity-50" />
                  </div>
                  <p className="text-muted-foreground">No vouchers found.</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first voucher to get started.</p>
                  <Button variant="outline" className="mt-4" onClick={() => handleCreate('sales')}>
                    Create First Voucher
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredVouchers.map((voucher) => (
                <TableRow key={voucher.id} className="hover:bg-table-row-hover transition-colors">
                  <TableCell className="px-4 py-3">
                    <p className="font-medium text-foreground">{voucher.voucher_number}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-sm text-muted-foreground capitalize">{voucher.type}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <p className="font-medium text-foreground">{voucher.party_ledger?.name}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{formatDate(voucher.date)}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="font-mono font-semibold text-foreground">
                      {formatAmount(voucher.total_amount)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(voucher.id)}
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
      
      {/* Voucher Form Modal */}
      {isFormOpen && (
        <VoucherForm 
          type={voucherType}
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSaveVoucher}
        />
      )}
    </div>
  )
}