import { useState, useEffect } from 'react';
import { useDayBook, useVoucherTypes } from '@/integrations/supabase/hooks'; // Use useDayBook and useVoucherTypes
import { cn } from '@/lib/utils';
import { Download, Printer, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';

interface DayBookData {
  transactions: Array<{
    date: string;
    voucherNumber: string;
    voucherType: string;
    particulars: string;
    debit: number;
    credit: number;
  }>;
  totalDebit: number;
  totalCredit: number;
}

export function DayBook() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [filters, setFilters] = useState({
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    type: 'all'
  });
  const { data: dayBook, isLoading, error } = useDayBook(filters);
  const { data: voucherTypes = [], isLoading: isVoucherTypesLoading } = useVoucherTypes();

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

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.info(`Exporting day book as ${format.toUpperCase()}...`);
  };

  const handlePrint = () => {
    window.print();
  };

  const allVoucherTypes = [{ value: 'all', label: 'All Types' }, ...voucherTypes.map(vt => ({ value: vt.name, label: vt.name.replace('-', ' ') }))];

  if (isLoading || isVoucherTypesLoading) {
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Day Book</h3>
        <p className="text-muted-foreground">Failed to load day book data. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!dayBook || dayBook.transactions.length === 0) {
    return (
      <div className="p-6 text-center py-8">
        <div className="text-muted-foreground mb-4">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Day Book Data</h3>
        <p className="text-muted-foreground">No transactions found for the selected period and type.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Day Book</h1>
          <p className="text-muted-foreground">Daily transaction register for {formatDate(filters.startDate)} to {formatDate(filters.endDate)}</p>
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

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Date Range:</span>
          </div>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-48"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-48"
          />
          <div className="flex items-center gap-2 ml-4">
            <Filter size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Type:</span>
          </div>
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allVoucherTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Day Book Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Daily Transactions</h3>
          <p className="text-sm text-muted-foreground">Showing {dayBook.transactions.length} transactions</p>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="bg-table-header border-b border-table-border">
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Date</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Voucher No.</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Type</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Particulars</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Debit (Dr)</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Credit (Cr)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border">
            {dayBook.transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No transactions found for the selected period and type.
                </td>
              </tr>
            ) : (
              dayBook.transactions.map((transaction, index) => (
                <tr key={`${transaction.date}-${transaction.voucherNumber}-${index}`} className="hover:bg-table-row-hover transition-colors cursor-pointer animate-slide-in" style={{ animationDelay: `${index * 20}ms` }}>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{formatDate(transaction.date)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-foreground">{transaction.voucherNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{transaction.voucherType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">{transaction.particulars}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "font-mono",
                      transaction.debit > 0 ? "text-foreground font-semibold" : "text-muted-foreground"
                    )}>
                      {transaction.debit > 0 ? formatAmount(transaction.debit) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "font-mono",
                      transaction.credit > 0 ? "text-foreground font-semibold" : "text-muted-foreground"
                    )}>
                      {transaction.credit > 0 ? formatAmount(transaction.credit) : '-'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-muted/50 border-t border-table-border">
              <td colSpan={4} className="px-4 py-3 text-right font-semibold text-foreground">
                Total
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-mono font-bold text-foreground">
                  {formatAmount(dayBook.totalDebit)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-mono font-bold text-foreground">
                  {formatAmount(dayBook.totalCredit)}
                </span>
              </td>
            </tr>
            <tr className="bg-muted/30">
              <td colSpan={6} className="px-4 py-3 text-center">
                <span className={cn(
                  "text-sm font-semibold",
                  Math.abs(dayBook.totalDebit - dayBook.totalCredit) < 0.01 
                    ? "text-success" 
                    : "text-destructive"
                )}>
                  {Math.abs(dayBook.totalDebit - dayBook.totalCredit) < 0.01 
                    ? "✓ Day Book Balances" 
                    : `✗ Difference: ₹${Math.abs(dayBook.totalDebit - dayBook.totalCredit).toLocaleString('en-IN')}`}
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
          <p className="text-2xl font-bold text-foreground">{formatAmount(dayBook.totalDebit)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Total Credit</p>
          <p className="text-2xl font-bold text-foreground">{formatAmount(dayBook.totalCredit)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Transaction Count</p>
          <p className="text-2xl font-bold text-foreground">{dayBook.transactions.length}</p>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
        <h3 className="font-semibold text-foreground mb-4">Day Book Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">What is Day Book?</h4>
            <p className="text-sm text-muted-foreground">
              A day book is a chronological record of all financial transactions of a business 
              recorded on a daily basis. It serves as the primary book of original entry.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Benefits</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Complete record of daily transactions</li>
              <li>• Helps in tracking cash flow</li>
              <li>• Basis for ledger posting</li>
              <li>• Useful for audit and compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}