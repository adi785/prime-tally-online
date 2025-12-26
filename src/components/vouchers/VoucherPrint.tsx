import { forwardRef } from 'react';
import { company } from '@/data/mockData';
import { Voucher } from '@/types/tally';

interface VoucherPrintProps {
  voucher: Voucher;
}

export const VoucherPrint = forwardRef<HTMLDivElement, VoucherPrintProps>(({ voucher }, ref) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalDebit = voucher.items
    .filter(item => item.type === 'debit')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalCredit = voucher.items
    .filter(item => item.type === 'credit')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div ref={ref} className="bg-white text-black p-8 max-w-[210mm] mx-auto font-sans text-sm print:p-6">
      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600 mt-1">{company.address}</p>
            <div className="mt-2 text-sm">
              <p><span className="font-semibold">GSTIN:</span> {company.gstin}</p>
              <p><span className="font-semibold">PAN:</span> {company.pan}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block border-2 border-gray-900 px-4 py-2">
              <p className="text-lg font-bold uppercase">
                {voucher.type.replace('-', ' ')} Voucher
              </p>
            </div>
            <p className="mt-2 text-xs text-gray-500">Original for Recipient</p>
          </div>
        </div>
      </div>

      {/* Voucher Details */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-gray-300 p-3 rounded">
          <p className="font-semibold text-gray-500 text-xs uppercase mb-2">Party</p>
          <p className="font-bold text-base">{voucher.partyName}</p>
        </div>
        <div className="border border-gray-300 p-3 rounded">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-semibold text-gray-500 text-xs uppercase">Voucher No.</p>
              <p className="font-bold">{voucher.voucherNumber}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-xs uppercase">Date</p>
              <p className="font-bold">{formatDate(voucher.date)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Particulars</th>
            <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Dr</th>
            <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Cr</th>
          </tr>
        </thead>
        <tbody>
          {voucher.items.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-2 py-2">{item.particulars}</td>
              <td className="border border-gray-300 px-2 py-2 text-right font-mono">
                {item.type === 'debit' ? formatAmount(item.amount) : ''}
              </td>
              <td className="border border-gray-300 px-2 py-2 text-right font-mono">
                {item.type === 'credit' ? formatAmount(item.amount) : ''}
              </td>
            </tr>
          ))}
          {/* Empty rows for print alignment */}
          {Array.from({ length: Math.max(0, 8 - voucher.items.length) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td className="border border-gray-300 px-2 py-2">&nbsp;</td>
              <td className="border border-gray-300 px-2 py-2"></td>
              <td className="border border-gray-300 px-2 py-2"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-1 border-t border-gray-300">
            <span className="font-semibold">Total Dr</span>
            <span className="font-mono font-semibold">{formatAmount(totalDebit)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-300">
            <span className="font-semibold">Total Cr</span>
            <span className="font-mono font-semibold">{formatAmount(totalCredit)}</span>
          </div>
        </div>
      </div>

      {/* Narration */}
      {voucher.narration && (
        <div className="mb-6">
          <p className="font-semibold text-gray-500 text-xs uppercase mb-1">Narration</p>
          <p className="text-sm">{voucher.narration}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm">Signature</p>
          </div>
          <div className="text-right">
            <p className="text-sm">For {company.name}</p>
            <p className="mt-12 text-sm">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
});

VoucherPrint.displayName = 'VoucherPrint';