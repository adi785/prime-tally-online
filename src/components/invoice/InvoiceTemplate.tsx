import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { company } from '@/data/mockData'
import { toast } from 'sonner'

interface InvoiceTemplateProps {
  voucher: any
  invoiceDetails?: {
    items: Array<{
      description: string
      hsn: string
      quantity: number
      rate: number
      amount: number
      gstRate: number
    }>
    subtotal: number
    cgst: number
    sgst: number
    igst: number
    total: number
    amountInWords: string
  }
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ voucher, invoiceDetails }, ref) => {
    const defaultItems = [
      { description: 'Product/Service as per voucher', hsn: '9983', quantity: 1, rate: voucher.total_amount, amount: voucher.total_amount, gstRate: 18 }
    ]

    const items = invoiceDetails?.items || defaultItems
    const subtotal = invoiceDetails?.subtotal || voucher.total_amount
    const cgst = invoiceDetails?.cgst || Math.round(subtotal * 0.09)
    const sgst = invoiceDetails?.sgst || Math.round(subtotal * 0.09)
    const total = invoiceDetails?.total || subtotal + cgst + sgst

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }

    const numberToWords = (num: number): string => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

      if (num === 0) return 'Zero'
      if (num < 20) return ones[num]
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
      if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '')
      if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '')
      if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '')
      return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '')
    }

    const amountInWords = invoiceDetails?.amountInWords || `Rupees ${numberToWords(Math.floor(total))} Only`

    const qrData = JSON.stringify({
      sellerGstin: company.gstin,
      invoiceNo: voucher.voucher_number,
      invoiceDate: voucher.date,
      invoiceValue: total,
      irn: `IRN${voucher.id}${Date.now()}`,
    })

    return (
      <div ref={ref} className="bg-white text-black p-8 max-w-[210mm] mx-auto font-sans text-sm print:p-6">
        {/* Header / Letterhead */}
        <div className="border-b-2 border-black pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-gray-600 mt-1">{company.address}</p>
              <div className="mt-2 text-sm">
                <p><span className="font-semibold">GSTIN:</span> {company.gstin}</p>
                <p><span className="font-semibold">PAN:</span> {company.pan}</p>
                <p><span className="font-semibold">Phone:</span> {company.phone} | <span className="font-semibold">Email:</span> {company.email}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block border-2 border-gray-900 px-4 py-2">
                <p className="text-lg font-bold">TAX INVOICE</p>
              </div>
              <p className="mt-2 text-xs text-gray-500">Original for Recipient</p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-300 p-3 rounded">
            <p className="font-semibold text-gray-500 text-xs uppercase mb-2">Bill To</p>
            <p className="font-bold text-base">{voucher.party_ledger?.name}</p>
            <p className="text-gray-600 text-sm">Address details here</p>
            <p className="mt-1 text-sm"><span className="font-semibold">GSTIN:</span> 27XXXXX1234X1ZX</p>
          </div>
          <div className="border border-gray-300 p-3 rounded">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-semibold text-gray-500 text-xs uppercase">Invoice No.</p>
                <p className="font-bold">{voucher.voucher_number}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-500 text-xs uppercase">Date</p>
                <p className="font-bold">{new Date(voucher.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-500 text-xs uppercase">Place of Supply</p>
                <p>Maharashtra (27)</p>
              </div>
              <div>
                <p className="font-semibold text-gray-500 text-xs uppercase">Due Date</p>
                <p>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">S.No</th>
              <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Description</th>
              <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">HSN/SAC</th>
              <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Qty</th>
              <th className="border border-gray-300 px-2 py-2 text-right text-xs font-semibold">Rate</th>
              <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">GST%</th>
              <th className="border border-gray-300 px-2 py-2 text-right text-xs font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-2 py-2">{item.description}</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{item.hsn}</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-2 py-2 text-right font-mono">₹{formatAmount(item.rate)}</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{item.gstRate}%</td>
                <td className="border border-gray-300 px-2 py-2 text-right font-mono">₹{formatAmount(item.amount)}</td>
              </tr>
            ))}
            {/* Empty rows for print alignment */}
            {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-gray-300 px-2 py-2">&nbsp;</td>
                <td className="border border-gray-300 px-2 py-2"></td>
                <td className="border border-gray-300 px-2 py-2"></td>
                <td className="border border-gray-300 px-2 py-2"></td>
                <td className="border border-gray-300 px-2 py-2"></td>
                <td className="border border-gray-300 px-2 py-2"></td>
                <td className="border border-gray-300 px-2 py-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end mb-6">
          <div className="w-72">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span>Subtotal</span>
              <span className="font-mono">₹{formatAmount(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span>CGST (9%)</span>
              <span className="font-mono">₹{formatAmount(cgst)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span>SGST (9%)</span>
              <span className="font-mono">₹{formatAmount(sgst)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-black font-bold text-base">
              <span>Grand Total</span>
              <span className="font-mono">₹{formatAmount(total)}</span>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="bg-gray-50 p-3 rounded mb-6 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Amount in Words</p>
          <p className="font-semibold">{amountInWords}</p>
        </div>

        {/* Footer Section */}
        <div className="grid grid-cols-3 gap-4 border-t border-gray-300 pt-4">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <QRCodeSVG value={qrData} size={80} level="M" />
            <p className="text-xs text-gray-500 mt-1">Scan for e-Invoice</p>
          </div>

          {/* Bank Details */}
          <div className="text-xs">
            <p className="font-semibold text-gray-500 uppercase mb-1">Bank Details</p>
            <p><span className="font-semibold">Bank:</span> HDFC Bank</p>
            <p><span className="font-semibold">A/C No:</span> 50100XXXXXXX789</p>
            <p><span className="font-semibold">IFSC:</span> HDFC0001234</p>
            <p><span className="font-semibold">Branch:</span> Mumbai Main</p>
          </div>

          {/* Signature */}
          <div className="text-right">
            <p className="font-semibold mb-8">For {company.name}</p>
            <div className="border-t border-gray-400 pt-1 inline-block px-4">
              <p className="text-xs text-gray-500">Authorized Signatory</p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="font-semibold text-xs text-gray-500 uppercase mb-2">Terms & Conditions</p>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Payment is due within 30 days from the date of invoice.</li>
            <li>Interest @ 18% p.a. will be charged on overdue payments.</li>
            <li>Goods once sold will not be taken back or exchanged.</li>
            <li>Subject to Mumbai jurisdiction only.</li>
            <li>E&OE (Errors and Omissions Excepted).</li>
          </ol>
        </div>

        {/* Footer Note */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>This is a computer-generated invoice and does not require a physical signature.</p>
        </div>
      </div>
    )
  }
)

InvoiceTemplate.displayName = 'InvoiceTemplate'