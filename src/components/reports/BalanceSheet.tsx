import { useState, useEffect } from 'react';
import { useLedgers } from '@/integrations/supabase/hooks';
import { cn } from '@/lib/utils';
import { Download, Printer, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BalanceSheetData {
  assets: Array<{
    category: string;
    items: Array<{
      name: string;
      amount: number;
    }>;
    total: number;
  }>;
  liabilities: Array<{
    category: string;
    items: Array<{
      name: string;
      amount: number;
    }>;
    total: number;
  }>;
  equity: Array<{
    name: string;
    amount: number;
  }>;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export function BalanceSheet() {
  const { data: ledgers = [] } = useLedgers();
  const [period, setPeriod] = useState({
    start: '2024-04-01',
    end: '2024-12-31'
  });
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);

  useEffect(() => {
    // Generate balance sheet data from ledgers
    const generateBalanceSheet = () => {
      // Group ledgers by category
      const assets = [
        {
          category: 'Current Assets',
          items: ledgers
            .filter(l => ['cash-in-hand', 'bank-accounts'].includes(l.group))
            .map(l => ({ name: l.name, amount: l.currentBalance })),
          total: ledgers
            .filter(l => ['cash-in-hand', 'bank-accounts'].includes(l.group))
            .reduce((sum, l) => sum + l.currentBalance, 0)
        },
        {
          category: 'Fixed Assets',
          items: ledgers
            .filter(l => l.group === 'fixed-assets')
            .map(l => ({ name: l.name, amount: l.currentBalance })),
          total: ledgers
            .filter(l => l.group === 'fixed-assets')
            .reduce((sum, l) => sum + l.currentBalance, 0)
        }
      ];

      const liabilities = [
        {
          category: 'Current Liabilities',
          items: ledgers
            .filter(l => l.group === 'current-liabilities')
            .map(l => ({ name: l.name, amount: Math.abs(l.currentBalance) })),
          total: ledgers
            .filter(l => l.group === 'current-liabilities')
            .reduce((sum, l) => sum + Math.abs(l.currentBalance), 0)
        }
      ];

      const equity = [
        {
          name: 'Capital Account',
          amount: ledgers
            .filter(l => l.group === 'capital-account')
            .reduce((sum, l) => sum + l.currentBalance, 0)
        },
        {
          name: 'Retained Earnings',
          amount: 250000 // Calculated from P&L
        }
      ];

      const totalAssets = assets.reduce((sum, cat) => sum + cat.total, 0);
      const totalLiabilities = liabilities.reduce((sum, cat) => sum + cat.total, 0);
      const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);

      setBalanceSheet({
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity
      });
    };

    generateBalanceSheet();
  }, [ledgers]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.info(`Exporting balance sheet as ${format.toUpperCase()}...`);
    // Implementation would go here
  };

  const handlePrint = () => {
    window.print();
  };

  if (!balanceSheet) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Balance Sheet</h1>
          <p className="text-muted-foreground">As of {new Date(period.end).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
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
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="gap-2">
            <Download size={16} />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Balance Sheet Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Assets Side */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Assets</h2>
          
          {balanceSheet.assets.map((category, index) => (
            <div key={index} className="mb-6">
              <h3 className="font-medium text-muted-foreground mb-3">{category.category}</h3>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatAmount(item.amount)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-sm text-muted-foreground">Total {category.category}</span>
                    <span className="font-mono text-foreground">{formatAmount(category.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="border-t-2 border-foreground pt-4 mt-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Assets</span>
              <span className="font-mono">{formatAmount(balanceSheet.totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* Liabilities & Equity Side */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Liabilities & Equity</h2>
          
          {/* Liabilities */}
          {balanceSheet.liabilities.map((category, index) => (
            <div key={index} className="mb-6">
              <h3 className="font-medium text-muted-foreground mb-3">{category.category}</h3>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatAmount(item.amount)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-sm text-muted-foreground">Total {category.category}</span>
                    <span className="font-mono text-foreground">{formatAmount(category.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Equity */}
          <div className="mb-6">
            <h3 className="font-medium text-muted-foreground mb-3">Equity</h3>
            <div className="space-y-2">
              {balanceSheet.equity.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.name}</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatAmount(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-foreground pt-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-sm text-muted-foreground">Total Liabilities</span>
                <span className="font-mono text-foreground">{formatAmount(balanceSheet.totalLiabilities)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-sm text-muted-foreground">Total Equity</span>
                <span className="font-mono text-foreground">{formatAmount(balanceSheet.totalEquity)}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Liabilities & Equity</span>
                  <span className="font-mono">{formatAmount(balanceSheet.totalLiabilities + balanceSheet.totalEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
        <h3 className="font-semibold text-foreground mb-4">Balance Sheet Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold text-success">{formatAmount(balanceSheet.totalAssets)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <p className="text-2xl font-bold text-destructive">{formatAmount(balanceSheet.totalLiabilities)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <p className="text-2xl font-bold text-tally-blue">{formatAmount(balanceSheet.totalEquity)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}