import { useState, useEffect } from 'react';
import { useStockItems } from '@/integrations/supabase/hooks';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Printer, TrendingUp, TrendingDown, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';

interface StockAnalysisData {
  items: Array<{
    name: string;
    group: string;
    quantity: number;
    rate: number;
    value: number;
    turnover: number;
    status: 'high' | 'medium' | 'low' | 'critical';
  }>;
  summary: {
    totalItems: number;
    totalValue: number;
    avgTurnover: number;
    criticalItems: number;
    slowMovingItems: number;
  };
}

export function StockAnalysis() {
  const { data: stockItems = [], isLoading, error } = useStockItems();
  const [analysis, setAnalysis] = useState<StockAnalysisData | null>(null);
  const [view, setView] = useState<'overview' | 'turnover' | 'valuation'>('overview');

  useEffect(() => {
    if (!stockItems || stockItems.length === 0) {
      setAnalysis(null);
      return;
    }

    // Generate stock analysis data
    const generateAnalysis = () => {
      const items = stockItems.map(item => {
        // Calculate turnover based on quantity and rate (simulated for now, would come from sales data)
        const turnover = item.quantity * item.rate * (Math.random() * 0.5 + 0.2); // Placeholder simulation
        
        // Determine status based on turnover and quantity
        let status: 'high' | 'medium' | 'low' | 'critical';
        if (item.quantity < 10 || turnover < 5000) { // Adjusted thresholds for more critical items
          status = 'critical';
        } else if (turnover > 20000) {
          status = 'high';
        } else if (turnover > 10000) {
          status = 'medium';
        } else {
          status = 'low';
        }

        return {
          name: item.name,
          group: item.group_name,
          quantity: item.quantity,
          rate: item.rate,
          value: item.value,
          turnover,
          status
        };
      });

      const totalItems = items.length;
      const totalValue = items.reduce((sum, item) => sum + item.value, 0);
      const avgTurnover = totalItems > 0 ? items.reduce((sum, item) => sum + item.turnover, 0) / totalItems : 0;
      const criticalItems = items.filter(item => item.status === 'critical').length;
      const slowMovingItems = items.filter(item => item.status === 'low').length;

      setAnalysis({
        items,
        summary: {
          totalItems,
          totalValue,
          avgTurnover,
          criticalItems,
          slowMovingItems
        }
      });
    };

    generateAnalysis();
  }, [stockItems]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-muted-foreground';
      case 'critical': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

  const getTurnoverChartData = () => {
    return analysis?.items.map(item => ({
      name: item.name,
      turnover: item.turnover,
      value: item.value
    })) || [];
  };

  const getValuationChartData = () => {
    const groupsMap = new Map<string, number>();
    analysis?.items.forEach(item => {
      groupsMap.set(item.group, (groupsMap.get(item.group) || 0) + item.value);
    });
    return Array.from(groupsMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.info(`Exporting stock analysis as ${format.toUpperCase()}...`);
  };

  const handlePrint = () => {
    window.print();
  };

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
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Stock Analysis</h3>
        <p className="text-muted-foreground">Failed to load stock analysis data. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!analysis || analysis.items.length === 0) {
    return (
      <div className="p-6 text-center py-8">
        <div className="text-muted-foreground mb-4">
          <Package size={32} className="mx-auto mb-2 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Stock Items for Analysis</h3>
        <p className="text-muted-foreground">Add stock items to view inventory analysis.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Analysis</h1>
          <p className="text-muted-foreground">Comprehensive inventory analysis and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer size={16} />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="gap-2">
            <Download size={16} />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-xl font-bold">{analysis.summary.totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-xl font-bold font-mono">{formatAmount(analysis.summary.totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10 text-warning">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Turnover</p>
              <p className="text-xl font-bold font-mono">{formatAmount(analysis.summary.avgTurnover)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Items</p>
              <p className="text-xl font-bold">{analysis.summary.criticalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground">
              <TrendingDown size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Slow Moving</p>
              <p className="text-xl font-bold">{analysis.summary.slowMovingItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">View:</span>
          <div className="flex gap-2">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'turnover', label: 'Turnover Analysis' },
              { key: 'valuation', label: 'Valuation Analysis' }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={view === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView(tab.key as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        {view === 'overview' && (
          <>
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-4">Stock Turnover Analysis</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTurnoverChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--table-border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="turnover" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-4">Stock Valuation by Group</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getValuationChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getValuationChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {view === 'turnover' && (
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Detailed Turnover Analysis</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getTurnoverChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--table-border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="turnover" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {view === 'valuation' && (
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Stock Valuation Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getValuationChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getValuationChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {getValuationChartData().map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }} />
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-foreground">{formatAmount(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Items Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Stock Items Analysis</h3>
          <p className="text-sm text-muted-foreground">Detailed analysis of all stock items</p>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="bg-table-header border-b border-table-border">
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Item Name</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Group</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">Status</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Quantity</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Rate</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Value</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Turnover</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border">
            {analysis.items.map((item, index) => (
              <tr key={item.name} className="hover:bg-table-row-hover transition-colors cursor-pointer animate-slide-in" style={{ animationDelay: `${index * 30}ms` }}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{item.name}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">{item.group}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(item.status)}`}>
                    <span className="w-2 h-2 rounded-full bg-white opacity-50"></span>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-sm text-foreground">{item.quantity.toLocaleString('en-IN')}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-sm text-muted-foreground">{formatAmount(item.rate)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono font-semibold text-foreground">{formatAmount(item.value)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-sm text-foreground">{formatAmount(item.turnover)}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/50 border-t border-table-border">
              <td colSpan={5} className="px-4 py-3 text-right font-semibold text-foreground">
                Total
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-mono font-bold text-foreground">
                  {formatAmount(analysis.summary.totalValue)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-mono font-bold text-foreground">
                  {formatAmount(analysis.items.reduce((sum, item) => sum + item.turnover, 0))}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}