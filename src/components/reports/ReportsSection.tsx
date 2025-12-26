import { useState } from 'react';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  PieChart, 
  FileText,
  Calendar,
  Download,
  Printer,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDashboardMetrics } from '@/integrations/supabase/hooks';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'financial' | 'gst' | 'inventory' | 'misc';
  shortcut?: string;
}

const reports: ReportCard[] = [
  { 
    id: 'balance-sheet', 
    title: 'Balance Sheet', 
    description: 'View financial position as of date',
    icon: <FileSpreadsheet size={24} />,
    category: 'financial',
    shortcut: 'B'
  },
  { 
    id: 'profit-loss', 
    title: 'Profit & Loss A/c', 
    description: 'Income and expense summary',
    icon: <TrendingUp size={24} />,
    category: 'financial',
    shortcut: 'P'
  },
  { 
    id: 'trial-balance', 
    title: 'Trial Balance', 
    description: 'List of all ledger balances',
    icon: <PieChart size={24} />,
    category: 'financial',
    shortcut: 'T'
  },
  { 
    id: 'day-book', 
    title: 'Day Book', 
    description: 'All transactions for a period',
    icon: <FileText size={24} />,
    category: 'financial',
    shortcut: 'D'
  },
  { 
    id: 'gstr-1', 
    title: 'GSTR-1', 
    description: 'Outward supplies return',
    icon: <FileText size={24} />,
    category: 'gst'
  },
  { 
    id: 'gstr-3b', 
    title: 'GSTR-3B', 
    description: 'Summary return',
    icon: <FileText size={24} />,
    category: 'gst'
  },
  { 
    id: 'stock-summary', 
    title: 'Stock Summary', 
    description: 'Current stock position',
    icon: <PieChart size={24} />,
    category: 'inventory'
  },
  { 
    id: 'ratio-analysis', 
    title: 'Ratio Analysis', 
    description: 'Key financial ratios',
    icon: <TrendingUp size={24} />,
    category: 'misc'
  },
];

const categories = [
  { id: 'financial', label: 'Financial Statements' },
  { id: 'gst', label: 'GST Reports' },
  { id: 'inventory', label: 'Inventory Reports' },
  { id: 'misc', label: 'Other Reports' },
];

export function ReportsSection() {
  const [period, setPeriod] = useState({
    start: '2024-04-01',
    end: '2024-12-31'
  });

  const { data: metrics } = useDashboardMetrics();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and view business reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar size={16} />
            Period: Apr 2024 - Dec 2024
          </Button>
        </div>
      </div>

      {/* Report Categories */}
      {categories.map((category, catIndex) => {
        const categoryReports = reports.filter(r => r.category === category.id);
        if (categoryReports.length === 0) return null;

        return (
          <div 
            key={category.id} 
            className="space-y-4 animate-fade-in"
            style={{ animationDelay: `${catIndex * 100}ms` }}
          >
            <h2 className="text-lg font-semibold text-foreground">{category.label}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryReports.map((report, index) => (
                <div
                  key={report.id}
                  className={cn(
                    "bg-card rounded-xl border border-border p-5 cursor-pointer transition-all duration-200",
                    "hover:border-primary/50 hover:shadow-md group animate-scale-in"
                  )}
                  style={{ animationDelay: `${(catIndex * 100) + (index * 50)}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      {report.icon}
                    </div>
                    {report.shortcut && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {report.shortcut}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {report.description}
                  </p>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <ExternalLink size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Printer size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Quick Stats */}
      <div className="bg-card rounded-xl border border-border p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <h3 className="font-semibold text-foreground mb-4">Financial Snapshot</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Gross Profit</p>
            <p className="text-xl font-bold font-mono amount-positive">
              ₹{formatAmount((metrics?.totalSales || 0) - (metrics?.totalPurchases || 0))}
            </p>
            <p className="text-xs text-muted-foreground">23.5% margin</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Net Profit</p>
            <p className="text-xl font-bold font-mono amount-positive">
              ₹{formatAmount((metrics?.totalSales || 0) - (metrics?.totalPurchases || 0) - 150000)}
            </p>
            <p className="text-xs text-muted-foreground">10.9% margin</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Ratio</p>
            <p className="text-xl font-bold font-mono text-foreground">
              {((metrics?.totalReceivables || 0) / Math.max(metrics?.totalPayables || 1, 1)).toFixed(2)}
            </p>
            <p className="text-xs text-success">Healthy</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Debt to Equity</p>
            <p className="text-xl font-bold font-mono text-foreground">
              {((metrics?.totalPayables || 0) / Math.max((metrics?.totalReceivables || 1), 1)).toFixed(2)}
            </p>
            <p className="text-xs text-success">Low Risk</p>
          </div>
        </div>
      </div>
    </div>
  );
}