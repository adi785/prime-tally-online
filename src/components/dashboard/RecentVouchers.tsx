import { vouchers } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ArrowUpFromLine, ArrowDownToLine, Wallet, CreditCard } from 'lucide-react';
import { VoucherType } from '@/types/tally';

const voucherTypeConfig: Record<VoucherType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  sales: { icon: <ArrowUpFromLine size={14} />, color: 'text-success', bgColor: 'bg-success/10' },
  purchase: { icon: <ArrowDownToLine size={14} />, color: 'text-warning', bgColor: 'bg-warning/10' },
  receipt: { icon: <Wallet size={14} />, color: 'text-tally-blue', bgColor: 'bg-tally-blue/10' },
  payment: { icon: <CreditCard size={14} />, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  journal: { icon: <ArrowUpFromLine size={14} />, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  contra: { icon: <ArrowUpFromLine size={14} />, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  'credit-note': { icon: <ArrowUpFromLine size={14} />, color: 'text-success', bgColor: 'bg-success/10' },
  'debit-note': { icon: <ArrowDownToLine size={14} />, color: 'text-warning', bgColor: 'bg-warning/10' },
};

export function RecentVouchers() {
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
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground">Last 5 voucher entries</p>
      </div>
      
      <div className="divide-y divide-border">
        {vouchers.slice(0, 5).map((voucher, index) => {
          const config = voucherTypeConfig[voucher.type];
          const isIncome = ['sales', 'receipt', 'credit-note'].includes(voucher.type);
          
          return (
            <div 
              key={voucher.id}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  config.bgColor,
                  config.color
                )}>
                  {config.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{voucher.partyName}</p>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {voucher.voucherNumber}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {voucher.type.replace('-', ' ')} • {formatDate(voucher.date)}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className={cn(
                    "font-mono font-semibold",
                    isIncome ? "amount-positive" : "amount-negative"
                  )}>
                    {isIncome ? '+' : '-'}{formatAmount(voucher.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-3 bg-muted/30 text-center">
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          View All Transactions →
        </button>
      </div>
    </div>
  );
}
