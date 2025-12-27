import { useState } from 'react'
import { useVouchers, useCreateVoucher, useUpdateVoucher, useDeleteVoucher, useVoucherTypes } from '@/integrations/supabase/hooks' // Import useVoucherTypes
import { Search, Plus, Edit, Trash2, ArrowUpFromLine, ArrowDownToLine, Wallet, CreditCard, Receipt, Calculator, Download, Printer, FileText } from 'lucide-react' // Added FileText as default icon
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { VoucherForm } from './VoucherForm'
import { InvoicePreviewModal } from '@/components/invoice/InvoicePreviewModal'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertCircle } from 'lucide-react'

// Define a mapping for icons and colors based on voucher type names
const voucherTypeDisplayConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  sales: { icon: ArrowUpFromLine, color: 'text-success', bgColor: 'bg-success/10' },
  purchase: { icon: ArrowDownToLine, color: 'text-warning', bgColor: 'bg-warning/10' },
  receipt: { icon: Wallet, color: 'text-tally-blue', bgColor: 'bg-tally-blue/10' },
  payment: { icon: CreditCard, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  journal: { icon: Receipt, color: 'text-tally-purple', bgColor: 'bg-tally-purple/10' },
  contra: { icon: Calculator, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  'credit-note': { icon: ArrowUpFromLine, color: 'text-success', bgColor: 'bg-success/10' }, // Assuming similar to sales
  'debit-note': { icon: ArrowDownToLine, color: 'text-warning', bgColor: 'bg-warning/10' }, // Assuming similar to purchase
};


export function VoucherList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentVoucherType, setCurrentVoucherType] = useState('sales') // This should be the 'name' string
  const [editingVoucher, setEditingVoucher] = useState<any>(null)
  const [selectedVoucherForPreview, setSelectedVoucherForPreview] = useState<any>(null)

  const { data: vouchers = [], isLoading, error } = useVouchers({ type: selectedType === 'all' ? undefined : selectedType })
  const { data: dbVoucherTypes = [], isLoading: isDbVoucherTypesLoading } = useVoucherTypes(); // Fetch voucher types from DB
  const { mutate: deleteVoucher, isPending: isDeleting } = useDeleteVoucher()
  const navigate = useNavigate()

  const filteredVouchers = vouchers.filter(voucher => 
    voucher.party?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      deleteVoucher(id)
    }
  }

  const handleCreate = (type: string) => {
    setCurrentVoucherType(type)
    setEditingVoucher(null) // Clear any editing state
    setIsFormOpen(true)
  }

  const handleEdit = (voucher: any) => {
    setCurrentVoucherType(voucher.type?.name || 'sales') // Use voucher.type.name
    setEditingVoucher(voucher)
    setIsFormOpen(true)
  }

  const handlePreview = (voucher: any) => {
    setSelectedVoucherForPreview(voucher)
  }

  const handleSaveVoucher = () => {
    setIsFormOpen(false)
    setEditingVoucher(null) // Clear editing state after save
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

  const getVoucherDisplayConfig = (typeName: string) => {
    return voucherTypeDisplayConfig[typeName] || { icon: FileText, color: 'text-muted-foreground', bgColor: 'bg-muted' };
  };

  if (isLoading || isDbVoucherTypesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center py-8">
        <div className="text-destructive mb-4">
          <AlertCircle size={32} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Vouchers</h3>
        <p className="text-muted-foreground">Failed to load vouchers. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
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
      
      {/* Voucher Type Tabs */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-4 overflow-x-auto">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedType === 'all' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Types
          </button>
          {dbVoucherTypes.map((type) => { // Use dbVoucherTypes here
            const config = getVoucherDisplayConfig(type.name);
            const Icon = config.icon;
            const count = vouchers.filter(v => v.type?.name === type.name).length;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.name)} // Use type.name for selection
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === type.name 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={16} />
                {type.name.replace('-', ' ')}
                <span className="ml-2 bg-muted px-2 py-0.5 rounded-full text-xs">
                  {count}
                </span>
              </button>
            )
          })}
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
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Printer size={16} />
          </Button>
          <Button variant="outline" size="icon">
            <Download size={16} />
          </Button>
        </div>
      </div>
      
      {/* Voucher Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              {selectedType === 'all' ? 'All Vouchers' : `${dbVoucherTypes.find(v => v.name === selectedType)?.name.replace('-', ' ')} Vouchers`}
            </h3>
            <span className="text-sm text-muted-foreground">
              {filteredVouchers.length} {selectedType === 'all' ? 'vouchers' : 'entries'}
            </span>
          </div>
        </div>
        
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
            {filteredVouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Plus size={32} className="mx-auto mb-2 opacity-50" />
                  </div>
                  <p className="text-muted-foreground">No {selectedType === 'all' ? 'vouchers' : dbVoucherTypes.find(v => v.name === selectedType)?.name.toLowerCase()} vouchers found.</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first {selectedType === 'all' ? 'voucher' : dbVoucherTypes.find(v => v.name === selectedType)?.name.toLowerCase()} voucher to get started.</p>
                  <Button variant="outline" className="mt-4" onClick={() => handleCreate(selectedType === 'all' ? 'sales' : selectedType)}>
                    Create {selectedType === 'all' ? 'First Voucher' : `${dbVoucherTypes.find(v => v.name === selectedType)?.name.replace('-', ' ')} Voucher`}
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredVouchers.map((voucher) => {
                const config = getVoucherDisplayConfig(voucher.type?.name || '');
                return (
                  <TableRow key={voucher.id} className="hover:bg-table-row-hover transition-colors">
                    <TableCell className="px-4 py-3">
                      <p className="font-medium text-foreground">{voucher.voucher_number}</p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        config.bgColor
                      } ${
                        config.color
                      }`}>
                        {voucher.type?.name.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="font-medium text-foreground">{voucher.party?.name}</p>
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handlePreview(voucher)}
                        >
                          <Printer size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEdit(voucher)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(voucher.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Voucher Form Modal */}
      {isFormOpen && (
        <VoucherForm 
          type={currentVoucherType}
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          voucher={editingVoucher} // Pass the voucher for editing
          onSave={handleSaveVoucher}
        />
      )}

      {/* Invoice Preview Modal */}
      {selectedVoucherForPreview && (
        <InvoicePreviewModal
          voucher={selectedVoucherForPreview}
          isOpen={!!selectedVoucherForPreview}
          onClose={() => setSelectedVoucherForPreview(null)}
        />
      )}
    </div>
  )
}