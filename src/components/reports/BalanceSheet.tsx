import { useState, useEffect } from 'react';
import { useBalanceSheet, useCompany } from '@/integrations/supabase/hooks'; // Use useBalanceSheet and useCompany
import { cn } from '@/lib/utils';
import { Download, Printer, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';

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
  const { data: balanceSheet, isLoading, error } = useBalanceSheet();
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
    toast.info(`Exporting balance sheet as ${format.toUpperCase()}...`);
    // Implementation would go here
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Balance Sheet</h3>
        <p className="text-muted-foreground">Failed to load balance sheet data. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!balanceSheet) {
    return (
      <div className="p-6 text-center py-8">
        <div className="text-muted-foreground mb-4">
          <FileSpreadsheet size={32} className="mx-auto mb-2 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Balance Sheet Data</h3>
        <p className="text-muted-foreground">Please ensure you have ledgers and transactions recorded.</p>
      </div>
    );
  }

  const financialYearEnd = company?.financial_year_end ? new Date(company.financial_year_end).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Balance Sheet</h1>
          <p className="text-muted-foreground">As of {financialYearEnd}</p>
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
          
          {balanceSheet.assets.map((category: any, index: number) => (
            <div key={index} className="mb-6">
              <h3 className="font-medium text-muted-foreground mb-3">{category.category}</h3>
              <div className="space-y-2">
                {category.items.map((item: any, itemIndex: number) => (
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
          {balanceSheet.liabilities.map((category: any, index: number) => (
            <div key={index} className="mb-6">
              <h3 className="font-medium text-muted-foreground mb-3">{category.category}</h3>
              <div className="space-y-2">
                {category.items.map((item: any, itemIndex: number) => (
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
              {balanceSheet.equity.map((item: any, index: number) => (
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