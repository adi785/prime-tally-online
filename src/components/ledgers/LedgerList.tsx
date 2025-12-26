import { useState, useEffect } from 'react';
import { useLedgers, useCreateLedger, useUpdateLedger, useDeleteLedger } from '@/integrations/supabase/hooks';
import { Ledger, LedgerGroup } from '@/types/tally';
import { cn } from '@/lib/utils';
import { Search, Plus, Filter, Download, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LedgerForm } from './LedgerForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const groupLabels: Record<LedgerGroup, string> = {
  'sundry-debtors': 'Sundry Debtors',
  'sundry-creditors': 'Sundry Creditors',
  'bank-accounts': 'Bank Accounts',
  'cash-in-hand': 'Cash-in-Hand',
  'sales-accounts': 'Sales Accounts',
  'purchase-accounts': 'Purchase Accounts',
  'direct-expenses': 'Direct Expenses',
  'indirect-expenses': 'Indirect Expenses',
  'direct-incomes': 'Direct Incomes',
  'indirect-incomes': 'Indirect Incomes',
  'fixed-assets': 'Fixed Assets',
  'current-assets': 'Current Assets',
  'current-liabilities': 'Current Liabilities',
  'capital-account': 'Capital Account',
};

export function LedgerList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<LedgerGroup | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);

  // Use Supabase hooks
  const { data: ledgers, isLoading, error } = useLedgers();
  const { mutate: createLedger, isPending: isCreating } = useCreateLedger();
  const { mutate: updateLedger, isPending: isUpdating } = useUpdateLedger();
  const { mutate: deleteLedger, isPending: isDeleting } = useDeleteLedger();

  console.log('LedgerList data:', { ledgers, isLoading, error });

  const filteredLedgers = ledgers?.filter(ledger => {
    const matchesSearch = ledger.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || ledger.group === selectedGroup;
    return matchesSearch && matchesGroup;
  }) || [];

  const handleCreateLedger = () => {
    setEditingLedger(null);
    setIsFormOpen(true);
  };

  const handleEditLedger = (ledger: Ledger) => {
    setEditingLedger(ledger);
    setIsFormOpen(true);
  };

  const handleSaveLedger = (ledgerData: Omit<Ledger, 'id' | 'currentBalance'>) => {
    if (editingLedger) {
      updateLedger({ id: editingLedger.id, ...ledgerData });
    } else {
      createLedger(ledgerData);
    }
    setIsFormOpen(false);
  };

  const handleDeleteLedger = (ledger: Ledger) => {
    if (window.confirm(`Are you sure you want to delete ${ledger.name}?`)) {
      deleteLedger(ledger.id);
    }
  };

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absAmount);
    
    return amount < 0 ? `${formatted} Cr` : `${formatted} Dr`;
  };

  const groups = Object.values(groupLabels);

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <div className="text-destructive mb-4">
            <AlertCircle size={32} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Ledgers</h3>
          <p className="text-muted-foreground">Failed to load ledgers. Please try again.</p>
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
          <h1 className="text-2xl font-bold text-foreground">Ledgers</h1>
          <p className="text-muted-foreground">Manage your account ledgers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={handleCreateLedger} disabled={isCreating}>
            <Plus size={16} />
            {isCreating ? 'Creating...' : 'Create Ledger'}
          </Button>
          <Button variant="outline" size="icon">
            <Filter size={16} />
          </Button>
          <Button variant="outline" size="icon">
            <Download size={16} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 animate-fade-in">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search ledgers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value as LedgerGroup | 'all')}
          className="h-10 px-4 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Groups</option>
          {groups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>

      {/* Ledger Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="bg-table-header border-b border-table-border">
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Name</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Group</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Opening Balance</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Current Balance</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-foreground w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredLedgers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Plus size={32} className="mx-auto mb-2 opacity-50" />
                  </div>
                  <p className="text-muted-foreground">No ledgers found.</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first ledger to get started.</p>
                  <Button variant="outline" className="mt-4" onClick={handleCreateLedger}>
                    Create First Ledger
                  </Button>
                </td>
              </tr>
            ) : (
              filteredLedgers.map((ledger, index) => (
                <tr 
                  key={ledger.id}
                  className="hover:bg-table-row-hover transition-colors cursor-pointer animate-slide-in"
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{ledger.name}</p>
                      {ledger.gstin && (
                        <p className="text-xs text-muted-foreground">GSTIN: {ledger.gstin}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{groupLabels[ledger.group]}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "font-mono text-sm",
                      ledger.opening_balance < 0 ? "amount-positive" : ledger.opening_balance > 0 ? "amount-neutral" : "text-muted-foreground"
                    )}>
                      {ledger.opening_balance === 0 ? '-' : formatAmount(ledger.opening_balance)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "font-mono text-sm font-semibold",
                      ledger.current_balance < 0 ? "amount-positive" : ledger.current_balance > 0 ? "amount-negative" : "text-muted-foreground"
                    )}>
                      {ledger.current_balance === 0 ? '-' : formatAmount(ledger.current_balance)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details">
                        <Eye size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        title="Edit Ledger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLedger(ledger);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                        title="Delete Ledger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLedger(ledger);
                        }}
                        disabled={isDeleting}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground animate-fade-in">
        <span>Showing {filteredLedgers.length} of {ledgers?.length || 0} ledgers</span>
        <div className="flex gap-6">
          <span>Total Debit: <span className="font-mono font-semibold text-foreground">₹{ledgers?.reduce((sum, l) => sum + Math.max(0, l.current_balance), 0).toLocaleString('en-IN') || '0'}</span></span>
          <span>Total Credit: <span className="font-mono font-semibold text-foreground">₹{ledgers?.reduce((sum, l) => sum + Math.abs(Math.min(0, l.current_balance)), 0).toLocaleString('en-IN') || '0'}</span></span>
        </div>
      </div>

      {/* Ledger Form Modal */}
      <LedgerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        ledger={editingLedger}
        onSave={handleSaveLedger}
      />
    </div>
  );
}