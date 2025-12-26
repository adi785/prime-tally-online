import { useRef } from 'react';
import { X, Printer, Download, Mail, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoiceTemplate } from './InvoiceTemplate';
import { Voucher } from '@/types/tally';
import { toast } from 'sonner';

interface InvoicePreviewModalProps {
  voucher: Voucher;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoicePreviewModal({ voucher, isOpen, onClose }: InvoicePreviewModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print the invoice');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${voucher.voucherNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: #fff;
            }
            .invoice-container {
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
            .p-3 { padding: 12px; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .pt-1 { padding-top: 4px; }
            .pt-4 { padding-top: 16px; }
            .pb-4 { padding-bottom: 16px; }
            .px-2 { padding-left: 8px; padding-right: 8px; }
            .px-4 { padding-left: 16px; padding-right: 16px; }
            .border { border: 1px solid #ccc; }
            .border-t { border-top: 1px solid #ccc; }
            .border-b { border-bottom: 1px solid #ccc; }
            .border-t-2 { border-top: 2px solid #000; }
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
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .gap-2 { gap: 8px; }
            .gap-4 { gap: 16px; }
            .gap-6 { gap: 24px; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .inline-block { display: inline-block; }
            .w-72 { width: 288px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .list-decimal { list-style-type: decimal; }
            .list-inside { list-style-position: inside; }
            .uppercase { text-transform: uppercase; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .invoice-container { padding: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${content.innerHTML}
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

    toast.success('Invoice sent to printer');
  };

  const handleDownloadPDF = () => {
    handlePrint();
    toast.info('Use "Save as PDF" option in the print dialog');
  };

  const handleEmail = () => {
    toast.info('Email functionality requires backend integration');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invoice/${voucher.id}`);
    toast.success('Invoice link copied to clipboard');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-muted/50">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Invoice Preview</h2>
            <p className="text-sm text-muted-foreground">{voucher.voucherNumber} • {voucher.partyName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2">
              <Copy size={14} />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail} className="gap-2">
              <Mail size={14} />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2">
              <Download size={14} />
              PDF
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-2">
              <Printer size={14} />
              Print
            </Button>
            <button onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6 tally-scrollbar">
          <div className="shadow-xl">
            <InvoiceTemplate ref={printRef} voucher={voucher} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-muted/30 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Format: A4 • GST Compliant • e-Invoice Ready</span>
          <span>Press Ctrl+P to print directly</span>
        </div>
      </div>
    </div>
  );
}
