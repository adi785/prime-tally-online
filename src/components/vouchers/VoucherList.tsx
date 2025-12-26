import { useState, useEffect } from 'react';
import { useVouchers, useCreateVoucher, useUpdateVoucher, useDeleteVoucher } from '@/integrations/supabase/hooks';
import { Voucher, VoucherType } from '@/types/tally';
import { cn } from '@/lib/utils';
import { Search, Plus, Filter, Download, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VoucherForm } from './VoucherForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const voucherTypeLabels: Record<VoucherType, string> = {
  sales: 'Sales',
  purchase: 'Purchase',
  receipt: 'Receipt',
  payment: 'Payment',
  journal: 'Journal',
  contra: 'Contra',
  'credit-note': 'Credit Note',
  'debit-note': 'Debit Note',
};

export function VoucherList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<VoucherType | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Use Supabase hooks
  const { data: vouchers = [], isLoading, error } = useVouchers();
  const { mutate: createVoucher, isPending: isCreating } = useCreateVoucher();
  const { mutate: updateVoucher, isPending: isUpdating } = useUpdateVoucher();
  const { mutate: deleteVoucher, isPending: isDeleting } = useDeleteVoucher();

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.party_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || voucher.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateVoucher = () => {
    setEditingVoucher(null);
    setIsFormOpen(true);
  };

  const handleEditVoucher = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setIsFormOpen(true);
  };

  const handleSaveVoucher = (voucherData: any) => {
    if (editingVoucher) {
      updateVoucher({ id: editingVoucher.id, ...voucherData });
    } else {
      createVoucher(voucherData);
    }
    setIsFormOpen(false);
  };

  const handleDeleteVoucher = (voucher: Voucher) => {
    if (window.confirm(`Are you sure you want to delete voucher ${voucher.voucher_number}?`)) {
      deleteVoucher(voucher.id);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const voucherTypes = Object.values(voucherTypeLabels);

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <div className="text-destructive mb-4">
            <AlertCircle size={32} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Vouchers</h3>
          <p className="text-muted-foreground">Failed to load vouchers. Please try again.</p>
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
          <h1 className="text-2xl font-bold text-foreground">Vouchers</h1>
          <p className="text-muted-foreground">Manage your voucher entries</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={handleCreateVoucher} disabled={isCreating}>
            <Plus size={16} />
            {isCreating ? 'Creating...' : 'Create Voucher'}
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
            placeholder="Search vouchers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as VoucherType | 'all')}
          className="h-10 px-4 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Types</option>
          {voucherTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Voucher Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="bg-table-header border-b border-table-border">
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Voucher No.</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Type</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Party</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Date</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Amount</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-foreground w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredVouchers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Plus size={32} className="mx-auto mb-2 opacity-50" />
                  </div>
                  <p className="text-muted-foreground">No vouchers found.</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first voucher to get started.</p>
                  <Button variant="outline" className="mt-4" onClick={handleCreateVoucher}>
                    Create First Voucher
                  </Button>
                </td>
              </tr>
            ) : (
              filteredVouchers.map((voucher, index) => (
                <tr 
                  key={voucher.id}
                  className="hover:bg-table-row-hover transition-colors cursor-pointer animate-slide-in"
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{voucher.voucher_number}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground capitalize">{voucherTypeLabels[voucher.type]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{voucher.party_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{formatDate(voucher.date)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono font-semibold text-foreground">
                      {formatAmount(voucher.total_amount)}
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
                        title="Edit Voucher"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditVoucher(voucher);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                        title="Delete Voucher"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVoucher(voucher);
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
        <span>Showing {filteredVouchers.length} of {vouchers.length} vouchers</span>
        <div className="flex gap-6">
          <span>Total Amount: <span className="font-mono font-semibold text-foreground">₹{vouchers.reduce((sum, v) => sum + v.total_amount, 0).toLocaleString('en-IN')}</span></span>
        </div>
      </div>

      {/* Voucher Form Modal */}
      {isFormOpen && (
        <VoucherForm
          type={editingVoucher?.type || 'sales'}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveVoucher}
        />
      )}
    </div>
  );
}