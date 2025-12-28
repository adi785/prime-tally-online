import { useState, useEffect } from 'react';
import { useProfitAndLoss, useCompany } from '@/integrations/supabase/hooks';
import { cn } from '@/lib/utils';
import { Download, Printer, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';

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
  const { data: profitLoss, isLoading, error } = useProfitAndLoss();
  const { data: company, isLoading: isCompanyLoading } = useCompany();

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

  if (isLoading || isCompanyLoading) {
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Profit & Loss</h3>
        <p className="text-muted-foreground">Failed to load profit and loss data. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!profitLoss) {
    return (
      <div className="p-6 text-center py-8">
        <div className="text-muted-foreground mb-4">
          <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Profit & Loss Data</h3>
        <p className="text-muted-foreground">Please ensure you have sales and purchase transactions recorded.</p>
      </div>
    );
  }

  const financialYearStart = company?.financial_year_start ? new Date(company.financial_year_start).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' }) : 'N/A';
  const financialYearEnd = company?.financial_year_end ? new Date(company.financial_year_end).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profit & Loss Statement</h1>
          <p className="text-muted-foreground">For the period {financialYearStart} to {financialYearEnd}</p>
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
            
            {profitLoss.income.map((category: any, index: number) => (
              <div key={index} className="mb-6">
                <h4 className="font-medium text-muted-foreground mb-3">{category.category}</h4>
                <div className="space-y-2">
                  {category.items.map((item: any, itemIndex: number) => (
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
            
            {profitLoss.expenses.map((category: any, index: number) => (
              <div key={index} className="mb-6">
                <h4 className="font-medium text-muted-foreground mb-3">{category.category}</h4>
                <div className="space-y-2">
                  {category.items.map((item: any, itemIndex: number) => (
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
            {profitLoss.totalIncome > 0 ? ((profitLoss.netProfit / profitLoss.totalIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}