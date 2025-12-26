import { useState, useEffect } from 'react';
import { useLedgers } from '@/integrations/supabase/hooks';
import { cn } from '@/lib/utils';
import { Download, Printer, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TrialBalanceData {
  ledgers: Array<{
    name: string;
    group: string;
    debit: number;
    credit: number;
  }>;
  totalDebit: number;
  totalCredit: number;
}

export function TrialBalance() {
  const { data: ledgers = [] } = useLedgers();
  const [period, setPeriod] = useState({
    start: '2024-04-01',
    end: '2024-12-31'
  });
  const [trialBalance, setTrialBalance] = useState<TrialBalanceData | null>(null);

  useEffect(() => {
    // Generate trial balance data from ledgers
    const generateTrialBalance = () => {
      const ledgerData = ledgers.map(ledger => {
        const debit = ledger.currentBalance > 0 ? ledger.currentBalance : 0;
        const credit = ledger.currentBalance < 0 ? Math.abs(ledger.currentBalance) : 0;
        
        return {
          name: ledger.name,
          group: ledger.group,
          debit,
          credit
        };
      });

      const totalDebit = ledgerData.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = ledgerData.reduce((sum, l) => sum + l.credit, 0);

      setTrialBalance({
        ledgers: ledgerData,
        totalDebit,
        totalCredit
      });
    };

    generateTrialBalance();
  }, [ledgers]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.info(`Exporting trial balance as ${format.toUpperCase()}...`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!trialBalance) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trial Balance</h1>
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

      {/* Trial Balance Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="bg-table-header border-b border-table-border">
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Ledger Name</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Group</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Debit (Dr)</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Credit (Cr)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border">
            {trialBalance.ledgers.map((ledger, index) => (
              <tr key={ledger.name} className="hover:bg-table-row-hover transition-colors cursor-pointer animate-slide-in" style={{ animationDelay: `${index * 20}ms` }}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{ledger.name}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground capitalize">{ledger.group.replace('-', ' ')}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={cn(
                    "font-mono",
                    ledger.debit > 0 ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}>
                    {ledger.debit > 0 ? formatAmount(ledger.debit) : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={cn(
                    "font-mono",
                    ledger.credit > 0 ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}>
                    {ledger.credit > 0 ? formatAmount(ledger.credit) : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/50 border-t border-table-border">
              <td colSpan={2} className="px-4 py-3 text-right font-semibold text-foreground">
                Total
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-mono font-bold text-foreground">
                  {formatAmount(trialBalance.totalDebit)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-mono font-bold text-foreground">
                  {formatAmount(trialBalance.totalCredit)}
                </span>
              </td>
            </tr>
            <tr className="bg-muted/30">
              <td colSpan={4} className="px-4 py-3 text-center">
                <span className={cn(
                  "text-sm font-semibold",
                  Math.abs(trialBalance.totalDebit - trialBalance.totalCredit) < 0.01 
                    ? "text-success" 
                    : "text-destructive"
                )}>
                  {Math.abs(trialBalance.totalDebit - trialBalance.totalCredit) < 0.01 
                    ? "✓ Trial Balance Matches" 
                    : `✗ Difference: ₹${Math.abs(trialBalance.totalDebit - trialBalance.totalCredit).toLocaleString('en-IN')}`}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Total Debit</p>
          <p className="text-2xl font-bold text-foreground">{formatAmount(trialBalance.totalDebit)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Total Credit</p>
          <p className="text-2xl font-bold text-foreground">{formatAmount(trialBalance.totalCredit)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Difference</p>
          <p className={cn(
            "text-2xl font-bold",
            Math.abs(trialBalance.totalDebit - trialBalance.totalCredit) < 0.01 ? "text-success" : "text-destructive"
          )}>
            ₹{Math.abs(trialBalance.totalDebit - trialBalance.totalCredit).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
        <h3 className="font-semibold text-foreground mb-4">Trial Balance Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">What is Trial Balance?</h4>
            <p className="text-sm text-muted-foreground">
              A trial balance is a bookkeeping worksheet in which the balance of all ledgers 
              are compiled into debit and credit account column totals that are equal.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Importance</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensures mathematical accuracy of books</li>
              <li>• Helps in preparing financial statements</li>
              <li>• Identifies errors in accounting entries</li>
              <li>• Provides basis for final accounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}