import { useState } from 'react';
import { useVouchers } from '@/integrations/supabase/hooks';
import { cn } from '@/lib/utils';
import { ArrowUpFromLine, ArrowDownToLine, Wallet, CreditCard, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoucherType } from '@/types/tally';
import { VoucherForm } from '@/components/vouchers/VoucherForm';
import { InvoicePreviewModal } from '@/components/invoice/InvoicePreviewModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  const { data: vouchers = [], isLoading } = useVouchers();
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [voucherForm, setVoucherForm] = useState<{ isOpen: boolean; type: VoucherType | null }>({
    isOpen: false,
    type: null
  });

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

  const handleEditVoucher = (voucher: any) => {
    setVoucherForm({ isOpen: true, type: voucher.type });
  };

  const handleSaveVoucher = (voucherData: any) => {
    console.log('Saving voucher:', voucherData);
    setVoucherForm({ isOpen: false, type: null });
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground">Last 5 voucher entries</p>
      </div>
      
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
            </div>
            <p className="text-muted-foreground">No transactions found.</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first voucher to get started.</p>
          </div>
        ) : (
          vouchers.slice(0, 5).map((voucher, index) => {
            const config = voucherTypeConfig[voucher.type];
            const isIncome = ['sales', 'receipt', 'credit-note'].includes(voucher.type);
            
            return (
              <div 
                key={voucher.id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer animate-slide-in group"
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
                      <p className="font-medium text-foreground truncate">{voucher.party_name}</p>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {voucher.voucher_number}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {voucher.type.replace('-', ' ')} • {formatDate(voucher.date)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVoucher(voucher);
                      }}
                    >
                      <Printer size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditVoucher(voucher);
                      }}
                    >
                      <span className="text-xs">Edit</span>
                    </Button>
                    <div className="text-right">
                      <p className={cn(
                        "font-mono font-semibold",
                        isIncome ? "amount-positive" : "amount-negative"
                      )}>
                        {isIncome ? '+' : '-'}{formatAmount(voucher.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="p-3 bg-muted/30 text-center">
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          View All Transactions →
        </button>
      </div>

      {/* Invoice Preview Modal */}
      {selectedVoucher && (
        <InvoicePreviewModal
          voucher={selectedVoucher}
          isOpen={!!selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}

      {/* Voucher Form Modal */}
      {voucherForm.type && (
        <VoucherForm
          type={voucherForm.type}
          isOpen={voucherForm.isOpen}
          onClose={() => setVoucherForm({ isOpen: false, type: null })}
          onSave={handleSaveVoucher}
        />
      )}
    </div>
  );
}