import { useState, useEffect } from 'react';
import { useStockItems } from '@/integrations/supabase/hooks';
import { cn } from '@/lib/utils';
import { AlertTriangle, Package, TrendingUp, TrendingDown, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';

interface ReorderAlert {
  id: string;
  name: string;
  currentStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  status: 'critical' | 'warning' | 'ok';
  urgency: 'high' | 'medium' | 'low';
  suggestedSupplier: string;
  estimatedCost: number;
}

export function ReorderAlerts() {
  const { data: stockItems = [], isLoading, error } = useStockItems();
  const [alerts, setAlerts] = useState<ReorderAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');

  useEffect(() => {
    if (!stockItems || stockItems.length === 0) {
      setAlerts([]);
      return;
    }

    // Generate reorder alerts based on stock levels
    const generateAlerts = () => {
      const newAlerts: ReorderAlert[] = stockItems.map(item => {
        // Calculate reorder level (e.g., 20% of initial quantity or a fixed low number)
        const reorderLevel = Math.floor(item.quantity * 0.2); // Example: 20% of current stock
        
        // Calculate reorder quantity (e.g., to bring stock up to 80% of initial or a fixed amount)
        const reorderQuantity = Math.floor(item.quantity * 0.8); // Example: 80% of current stock
        
        // Determine status based on current stock vs reorder level
        let status: 'critical' | 'warning' | 'ok';
        let urgency: 'high' | 'medium' | 'low';
        
        if (item.quantity <= reorderLevel) {
          status = 'critical';
          urgency = 'high';
        } else if (item.quantity <= reorderLevel * 2) { // Warning if within 2x reorder level
          status = 'warning';
          urgency = 'medium';
        } else {
          status = 'ok';
          urgency = 'low';
        }

        return {
          id: item.id,
          name: item.name,
          currentStock: item.quantity,
          reorderLevel,
          reorderQuantity,
          status,
          urgency,
          suggestedSupplier: `Supplier ${Math.floor(Math.random() * 5) + 1}`, // Placeholder
          estimatedCost: reorderQuantity * item.rate
        };
      }).filter(alert => alert.status !== 'ok'); // Only show critical and warning alerts

      // Sort by urgency and status
      newAlerts.sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        const statusOrder = { critical: 3, warning: 2, ok: 1 };
        
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        }
        return statusOrder[b.status] - statusOrder[a.status];
      });

      setAlerts(newAlerts);
    };

    generateAlerts();
  }, [stockItems]);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'critical') return alert.status === 'critical';
    if (filter === 'warning') return alert.status === 'warning';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'ok': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted-foreground';
    }
  };

  const handleReorder = (alert: ReorderAlert) => {
    toast.success(`Reorder initiated for ${alert.name} - ${alert.reorderQuantity} units`);
    // Implementation would go here (e.g., create a purchase order)
  };

  const handleRefresh = () => {
    toast.info('Refreshing stock levels...');
    // Invalidate stockItems query to refetch data
    // queryClient.invalidateQueries({ queryKey: ['stockItems'] });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAlertStats = () => {
    const total = alerts.length;
    const critical = alerts.filter(a => a.status === 'critical').length;
    const warning = alerts.filter(a => a.status === 'warning').length;
    const ok = alerts.filter(a => a.status === 'ok').length;
    const totalCost = alerts.reduce((sum, a) => sum + a.estimatedCost, 0);

    return { total, critical, warning, ok, totalCost };
  };

  const stats = getAlertStats();

  if (isLoading) {
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Reorder Alerts</h3>
        <p className="text-muted-foreground">Failed to load reorder alerts. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reorder Alerts</h1>
          <p className="text-muted-foreground">Stock level monitoring and reorder recommendations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-xl font-bold">{stats.critical}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10 text-warning">
              <TrendingDown size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warning</p>
              <p className="text-xl font-bold">{stats.warning}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">OK</p>
              <p className="text-xl font-bold">{stats.ok}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-tally-blue/10 text-tally-blue">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Reorder Cost</p>
              <p className="text-xl font-bold font-mono">{formatAmount(stats.totalCost)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">Filter:</span>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', count: stats.total },
              { key: 'critical', label: 'Critical', count: stats.critical },
              { key: 'warning', label: 'Warning', count: stats.warning }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(tab.key as any)}
                className="gap-2"
              >
                {tab.label}
                <span className="text-xs bg-background/50 px-2 py-0.5 rounded">{tab.count}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4 animate-fade-in">
        {filteredAlerts.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <Package size={48} className="mx-auto mb-2 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Reorder Alerts</h3>
            <p className="text-sm text-muted-foreground">All items are within safe stock levels.</p>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => (
            <div key={alert.id} className="bg-card rounded-xl border border-border p-6 animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(alert.status)}`}>
                    <span className={`w-2 h-2 rounded-full inline-block mr-2 ${getUrgencyColor(alert.urgency)}`}></span>
                    {alert.status.toUpperCase()} • {alert.urgency.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{alert.name}</h3>
                    <p className="text-sm text-muted-foreground">Supplier: {alert.suggestedSupplier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleReorder(alert)}
                    className="gap-2"
                  >
                    <Package size={16} />
                    Reorder
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Stock</p>
                  <p className="text-2xl font-bold text-foreground">{alert.currentStock.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Reorder Level</p>
                  <p className="text-2xl font-bold text-warning">{alert.reorderLevel.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Reorder Qty</p>
                  <p className="text-2xl font-bold text-foreground">{alert.reorderQuantity.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="text-2xl font-bold text-tally-blue">{formatAmount(alert.estimatedCost)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Stock Level</span>
                  <span>{Math.round((alert.currentStock / (alert.currentStock + alert.reorderQuantity)) * 100)}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUrgencyColor(alert.urgency)}`}
                    style={{ 
                      width: `${Math.min(100, (alert.currentStock / (alert.currentStock + alert.reorderQuantity)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recommendations */}
      {filteredAlerts.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">Reorder Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Priority Actions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Reorder critical items immediately</li>
                <li>• Review supplier lead times</li>
                <li>• Consider safety stock levels</li>
              </ul>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Cost Optimization</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Bulk ordering for high-usage items</li>
                <li>• Negotiate better rates</li>
                <li>• Review reorder quantities</li>
              </ul>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Inventory Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Implement ABC analysis</li>
                <li>• Regular stock audits</li>
                <li>• Monitor usage patterns</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}