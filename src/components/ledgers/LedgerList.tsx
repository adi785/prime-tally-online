import { useState } from 'react'
import { useLedgers, useCreateLedger, useUpdateLedger, useDeleteLedger, useLedgerGroups } from '@/integrations/supabase/hooks'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { LedgerForm } from './LedgerForm'

export function LedgerList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { data: ledgers = [], isLoading } = useLedgers()
  const { data: groups = [] } = useLedgerGroups()
  const { mutate: createLedger } = useCreateLedger()
  const { mutate: updateLedger } = useUpdateLedger()
  const { mutate: deleteLedger } = useDeleteLedger()

  const filteredLedgers = ledgers.filter(ledger => 
    ledger.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ledger?')) {
      deleteLedger(id)
    }
  }

  const handleCreate = () => {
    setIsFormOpen(true)
  }

  const handleSave = () => {
    setIsFormOpen(false)
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ledgers</h1>
          <p className="text-muted-foreground">Manage your account ledgers</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus size={16} /> Create Ledger
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search ledgers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10" 
          />
        </div>
      </div>
      
      {/* Ledger Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header border-b border-table-border">
              <TableHead className="text-left px-4 py-3 text-sm font-semibold text-foreground">Name</TableHead>
              <TableHead className="text-left px-4 py-3 text-sm font-semibold text-foreground">Group</TableHead>
              <TableHead className="text-right px-4 py-3 text-sm font-semibold text-foreground">Opening Balance</TableHead>
              <TableHead className="text-right px-4 py-3 text-sm font-semibold text-foreground">Current Balance</TableHead>
              <TableHead className="text-center px-4 py-3 text-sm font-semibold text-foreground w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-table-border">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="p-8 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLedgers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Plus size={32} className="mx-auto mb-2 opacity-50" />
                  </div>
                  <p className="text-muted-foreground">No ledgers found.</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first ledger to get started.</p>
                  <Button variant="outline" className="mt-4" onClick={handleCreate}>
                    Create First Ledger
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredLedgers.map((ledger) => (
                <TableRow key={ledger.id} className="hover:bg-table-row-hover transition-colors">
                  <TableCell className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{ledger.name}</p>
                      {ledger.gstin && (
                        <p className="text-xs text-muted-foreground">GSTIN: {ledger.gstin}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-sm text-muted-foreground capitalize">
                      {ledger.group?.name?.replace('-', ' ') || ledger.group_name?.replace('-', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="font-mono text-sm">
                      {ledger.opening_balance === 0 ? '-' : formatAmount(ledger.opening_balance)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="font-mono text-sm font-semibold">
                      {ledger.current_balance === 0 ? '-' : formatAmount(ledger.current_balance)}
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
                        onClick={() => handleDelete(ledger.id)}
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
      
      {/* Ledger Form Modal */}
      {isFormOpen && (
        <LedgerForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSave}
        />
      )}
    </div>
  )
}