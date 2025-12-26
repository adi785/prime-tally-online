import { useState, useRef } from 'react';
import { vouchers } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ArrowUpFromLine, ArrowDownToLine, Wallet, CreditCard, Printer } from 'lucide-react';
import { VoucherType, Voucher } from '@/types/tally';
import { InvoicePreviewModal } from '@/components/invoice/InvoicePreviewModal';
import { Button } from '@/components/ui/button';
import { VoucherPrint } from '@/components/vouchers/VoucherPrint';
import { toast } from 'sonner';

const voucherTypeConfig: Record<VoucherType, { 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string 
}> = {
  sales: { 
    icon: <ArrowUpFromLine size={14} />, 
    color: 'text-success', 
    bgColor: 'bg-success/10' 
  },
  purchase: { 
    icon: <ArrowDownToLine size={14} />, 
    color: 'text-warning', 
    bgColor: 'bg-warning/10' 
  },
  receipt: { 
    icon: <Wallet size={14} />, 
    color: 'text-tally-blue', 
    bgColor: 'bg-tally-blue/10' 
  },
  payment: { 
    icon: <CreditCard size={14} />, 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10' 
  },
  journal: { 
    icon: <ArrowUpFromLine size={14} />, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted' 
  },
  contra: { 
    icon: <ArrowUpFromLine size={14} />, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted' 
  },
  'credit-note': { 
    icon: <ArrowUpFromLine size={14} />, 
    color: 'text-success', 
    bgColor: 'bg-success/10' 
  },
  'debit-note': { 
    icon: <ArrowDownToLine size={14} />, 
    color: 'text-warning', 
    bgColor: 'bg-warning/10' 
  },
};

export function RecentVouchers() {
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
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

  const handlePrint = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    
    // Wait for the modal to render, then trigger print
    setTimeout(() => {
      const printContent = printRef.current;
      if (!printContent) return;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to print the voucher');
        return;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Voucher ${voucher.voucherNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 12px; 
              line-height: 1.4; 
              color: #000; 
              background: #fff; 
            }
            .voucher-container { 
              max-width: 210mm; 
              margin: 0 auto; 
              padding: 20mm 15mm; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            th, td { 
              border: 1px solid #ccc; 
              padding: 6px 8px; 
            }
            th { 
              background: #f5f5f5; 
              font-weight: 600; 
              text-align: left; 
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-mono { font-family: 'Courier New', monospace; }
            .text-xs { font-size: 10px; }
            .text-sm { font-size: 11px; }
            .text-base { font-size: 13px; }
            .text-lg { font-size: 15px; }
            .text-2xl { font-size: 20px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            .mt-4 { margin-top: 16px; }
            .mt-6 { margin-top: 24px; }
            .mt-12 { margin-top: 48px; }
            .p-3 { padding: 12px; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .pt-1 { padding-top: 4px; }
            .pt-4 { padding-top: 16px; }
            .pt-8 { padding-top: 32px; }
            .pb-4 { padding-bottom: 16px; }
            .px-2 { padding-left: 8px; padding-right: 8px; }
            .px-4 { padding-left: 16px; padding-right: 16px; }
            .border { border: 1px solid #ccc; }
            .border-t { border-top: 1px solid #ccc; }
            .border-b { border-bottom: 1px solid #ccc; }
            .border-b-2 { border-bottom: 2px solid #000; }
            .rounded { border-radius: 4px; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .text-gray-400 { color: #9ca3af; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-900 { color: #111827; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .gap-2 { gap: 8px; }
            .gap-6 { gap: 24px; }
            .gap-8 { gap: 32px; }
            .flex { display: flex; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .inline-block { display: inline-block; }
            .w-64 { width: 256px; }
            .uppercase { text-transform: uppercase; }
            @media print {
              body { 
                print-color-adjust: exact; 
                -webkit-print-color-adjust: exact; 
              }
              .voucher-container { 
                padding: 10mm; 
              }
            }
          </style>
        </head>
        <body>
          <div class="voucher-container">
            ${printContent.innerHTML}
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      
      toast.success('Voucher sent to printer');
    }, 100);
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
                    <p className="font-medium text-foreground truncate">{voucher.partyName}</p>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {voucher.voucherNumber}
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
                      handlePrint(voucher);
                    }}
                  >
                    <Printer size={14} />
                  </Button>
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
            </div>
          );
        })}
      </div>
      <div className="p-3 bg-muted/30 text-center">
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          View All Transactions →
        </button>
      </div>
      
      {/* Hidden print content */}
      <div className="hidden">
        {selectedVoucher && (
          <VoucherPrint ref={printRef} voucher={selectedVoucher} />
        )}
      </div>
    </div>
  );
}