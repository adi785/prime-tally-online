import { useState } from 'react';
import { useStockItems, useCreateStockItem } from '@/integrations/nhost/hooks';
import { cn } from '@/lib/utils';
import { Search, Plus, Filter, Download, Package, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function InventorySection() {
  const { data: stockItems = [], isLoading, error } = useStockItems();
  const { mutate: createStockItem, isPending: isCreating } = useCreateStockItem();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

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

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <div className="text-destructive mb-4">
            <AlertTriangle size={32} className="mx-auto" />
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
        <Button className="gap-2" onClick={() => createStockItem({
          name: 'New Item',
          unit: 'Nos',
          quantity: 100,
          rate: 50,
          value: 5000,
          group_name: 'Raw Materials'
        })} disabled={isCreating}>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                  </div>
                  <p className="text-muted-foreground">No stock items found.</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first stock item to get started.</p>
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
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}