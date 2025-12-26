import { useState, useEffect } from 'react';
import { useVouchers, useLedgers } from '@/integrations/supabase/hooks';
import { cn } from '@/lib/utils';
import { Download, Printer, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProfitLossData {
  income: Array<{
    category: string;
    items: Array<{
      name: string;
      amount: number;
    }>;
    total: number;
  }>;
  expenses: Array<{
    category: string;
    items: Array<{
      name: string;
      amount: number;
    }>;
    total: number;
  }>;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export function ProfitLoss() {
  const { data: vouchers = [] } = useVouchers();
  const { data: ledgers = [] } = useLedgers();
  const [period, setPeriod] = useState({
    start: '2024-04-01',
    end: '2024-12-31'
  });
  const [profitLoss, setProfitLoss] = useState<ProfitLossData | null>(null);

  useEffect(() => {
    // Generate P&L data from vouchers and ledgers
    const generateProfitLoss = () => {
      // Calculate income from sales vouchers
      const salesTotal = vouchers
        .filter(v => v.type === 'sales')
        .reduce((sum, v) => sum + v.total_amount, 0);

      // Calculate expenses from purchase vouchers
      const purchasesTotal = vouchers
        .filter(v => v.type === 'purchase')
        .reduce((sum, v) => sum + v.total_amount, 0);

      // Calculate other income and expenses from ledgers
      const otherIncome = ledgers
        .filter(l => l.group === 'indirect-incomes')
        .reduce((sum, l) => sum + l.currentBalance, 0);

      const directExpenses = ledgers
        .filter(l => l.group === 'direct-expenses')
        .reduce((sum, l) => sum + Math.abs(l.currentBalance), 0);

      const indirectExpenses = ledgers
        .filter(l => l.group === 'indirect-expenses')
        .reduce((sum, l) => sum + Math.abs(l.currentBalance), 0);

      const income = [
        {
          category: 'Sales Revenue',
          items: [
            { name: 'Sales - Goods', amount: salesTotal * 0.7 },
            { name: 'Sales - Services', amount: salesTotal * 0.3 }
          ],
          total: salesTotal
        },
        {
          category: 'Other Income',
          items: [
            { name: 'Interest Income', amount: otherIncome }
          ],
          total: otherIncome
        }
      ];

      const expenses = [
        {
          category: 'Cost of Goods Sold',
          items: [
            { name: 'Purchase - Raw Materials', amount: purchasesTotal * 0.6 },
            { name: 'Purchase - Trading Goods', amount: purchasesTotal * 0.4 }
          ],
          total: purchasesTotal
        },
        {
          category: 'Direct Expenses',
          items: ledgers
            .filter(l => l.group === 'direct-expenses')
            .map(l => ({ name: l.name, amount: Math.abs(l.currentBalance) })),
          total: directExpenses
        },
        {
          category: 'Indirect Expenses',
          items: ledgers
            .filter(l => l.group === 'indirect-expenses')
            .map(l => ({ name: l.name, amount: Math.abs(l.currentBalance) })),
          total: indirectExpenses
        }
      ];

      const totalIncome = income.reduce((sum, cat) => sum + cat.total, 0);
      const totalExpenses = expenses.reduce((sum, cat) => sum + cat.total, 0);
      const netProfit = totalIncome - totalExpenses;

      setProfitLoss({
        income,
        expenses,
        totalIncome,
        totalExpenses,
        netProfit
      });
    };

    generateProfitLoss();
  }, [vouchers, ledgers]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.info(`Exporting P&L statement as ${format.toUpperCase()}...`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!profitLoss) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profit & Loss Statement</h1>
          <p className="text-muted-foreground">For the period {new Date(period.start).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' })} to {new Date(period.end).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
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

      {/* P&L Content */}
      <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
        <h2 className="text-lg font-semibold text-foreground mb-6">Income Statement</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income Side */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Income</h3>
            
            {profitLoss.income.map((category, index) => (
              <div key={index} className="mb-6">
                <h4 className="font-medium text-muted-foreground mb-3">{category.category}</h4>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.name}</span>
                      <span className="font-mono font-semibold text-success">
                        {formatAmount(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-sm text-muted-foreground">Total {category.category}</span>
                      <span className="font-mono text-success">{formatAmount(category.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t-2 border-foreground pt-4 mt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Income</span>
                <span className="font-mono text-success">{formatAmount(profitLoss.totalIncome)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Side */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Expenses</h3>
            
            {profitLoss.expenses.map((category, index) => (
              <div key={index} className="mb-6">
                <h4 className="font-medium text-muted-foreground mb-3">{category.category}</h4>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.name}</span>
                      <span className="font-mono font-semibold text-destructive">
                        {formatAmount(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-sm text-muted-foreground">Total {category.category}</span>
                      <span className="font-mono text-destructive">{formatAmount(category.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t-2 border-foreground pt-4 mt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Expenses</span>
                <span className="font-mono text-destructive">{formatAmount(profitLoss.totalExpenses)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="border-t-2 border-foreground pt-6 mt-6">
          <div className="flex items-center justify-between text-xl font-bold">
            <span>Net Profit / (Loss)</span>
            <span className={cn(
              "font-mono",
              profitLoss.netProfit >= 0 ? "text-success" : "text-destructive"
            )}>
              {profitLoss.netProfit >= 0 ? '+' : '-'}{formatAmount(Math.abs(profitLoss.netProfit))}
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
          <p className="text-2xl font-bold text-success">{formatAmount(profitLoss.totalIncome)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
          <p className="text-2xl font-bold text-destructive">{formatAmount(profitLoss.totalExpenses)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Net Profit Margin</p>
          <p className="text-2xl font-bold text-tally-blue">
            {((profitLoss.netProfit / profitLoss.totalIncome) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}