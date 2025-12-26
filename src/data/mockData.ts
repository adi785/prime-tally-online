import { Ledger, Voucher, DashboardMetrics, StockItem, Company } from '@/types/tally';

export const company: Company = {
  name: 'ABC Enterprises Pvt. Ltd.',
  address: '123 Business Park, Mumbai, Maharashtra - 400001',
  gstin: '27AABCU9603R1ZM',
  pan: 'AABCU9603R',
  phone: '+91 22 2345 6789',
  email: 'info@abcenterprises.com',
  financialYearStart: '2024-04-01',
  financialYearEnd: '2025-03-31',
};

export const ledgers: Ledger[] = [
  { id: '1', name: 'Cash', group: 'cash-in-hand', openingBalance: 50000, currentBalance: 125000 },
  { id: '2', name: 'HDFC Bank Current A/c', group: 'bank-accounts', openingBalance: 500000, currentBalance: 875000 },
  { id: '3', name: 'ICICI Bank Savings', group: 'bank-accounts', openingBalance: 200000, currentBalance: 185000 },
  { id: '4', name: 'Reliance Industries Ltd', group: 'sundry-debtors', openingBalance: 150000, currentBalance: 285000, gstin: '27AABCR1234R1Z5' },
  { id: '5', name: 'Tata Motors', group: 'sundry-debtors', openingBalance: 75000, currentBalance: 142000, gstin: '27AABCT5678R1Z8' },
  { id: '6', name: 'Infosys Technologies', group: 'sundry-debtors', openingBalance: 0, currentBalance: 95000, gstin: '29AABCI1234R1Z2' },
  { id: '7', name: 'Mahindra & Mahindra', group: 'sundry-creditors', openingBalance: -100000, currentBalance: -175000, gstin: '27AABCM9012R1Z1' },
  { id: '8', name: 'Larsen & Toubro', group: 'sundry-creditors', openingBalance: -50000, currentBalance: -225000, gstin: '27AABCL3456R1Z4' },
  { id: '9', name: 'Sales - Goods', group: 'sales-accounts', openingBalance: 0, currentBalance: -1250000 },
  { id: '10', name: 'Sales - Services', group: 'sales-accounts', openingBalance: 0, currentBalance: -450000 },
  { id: '11', name: 'Purchase - Raw Materials', group: 'purchase-accounts', openingBalance: 0, currentBalance: 875000 },
  { id: '12', name: 'Purchase - Trading Goods', group: 'purchase-accounts', openingBalance: 0, currentBalance: 425000 },
  { id: '13', name: 'Rent Expense', group: 'indirect-expenses', openingBalance: 0, currentBalance: 120000 },
  { id: '14', name: 'Electricity Expense', group: 'indirect-expenses', openingBalance: 0, currentBalance: 45000 },
  { id: '15', name: 'Salary Expense', group: 'indirect-expenses', openingBalance: 0, currentBalance: 350000 },
  { id: '16', name: 'Office Equipment', group: 'fixed-assets', openingBalance: 250000, currentBalance: 250000 },
  { id: '17', name: 'Furniture & Fixtures', group: 'fixed-assets', openingBalance: 150000, currentBalance: 150000 },
  { id: '18', name: 'Interest Income', group: 'indirect-incomes', openingBalance: 0, currentBalance: -25000 },
];

export const vouchers: Voucher[] = [
  {
    id: '1',
    voucherNumber: 'SV-001',
    type: 'sales',
    date: '2024-12-26',
    partyName: 'Reliance Industries Ltd',
    partyLedgerId: '4',
    items: [
      { id: '1', particulars: 'Sales - Goods', ledgerId: '9', amount: 135000, type: 'credit' },
    ],
    narration: 'Sale of finished goods',
    totalAmount: 135000,
    createdAt: '2024-12-26T10:30:00Z',
  },
  {
    id: '2',
    voucherNumber: 'PV-001',
    type: 'purchase',
    date: '2024-12-25',
    partyName: 'Mahindra & Mahindra',
    partyLedgerId: '7',
    items: [
      { id: '1', particulars: 'Purchase - Raw Materials', ledgerId: '11', amount: 75000, type: 'debit' },
    ],
    narration: 'Purchase of raw materials',
    totalAmount: 75000,
    createdAt: '2024-12-25T14:15:00Z',
  },
  {
    id: '3',
    voucherNumber: 'RV-001',
    type: 'receipt',
    date: '2024-12-24',
    partyName: 'Tata Motors',
    partyLedgerId: '5',
    items: [
      { id: '1', particulars: 'HDFC Bank Current A/c', ledgerId: '2', amount: 50000, type: 'debit' },
    ],
    narration: 'Receipt against invoice',
    totalAmount: 50000,
    createdAt: '2024-12-24T11:00:00Z',
  },
  {
    id: '4',
    voucherNumber: 'PMT-001',
    type: 'payment',
    date: '2024-12-23',
    partyName: 'Larsen & Toubro',
    partyLedgerId: '8',
    items: [
      { id: '1', particulars: 'HDFC Bank Current A/c', ledgerId: '2', amount: 100000, type: 'credit' },
    ],
    narration: 'Payment for supplies',
    totalAmount: 100000,
    createdAt: '2024-12-23T16:45:00Z',
  },
  {
    id: '5',
    voucherNumber: 'SV-002',
    type: 'sales',
    date: '2024-12-22',
    partyName: 'Infosys Technologies',
    partyLedgerId: '6',
    items: [
      { id: '1', particulars: 'Sales - Services', ledgerId: '10', amount: 95000, type: 'credit' },
    ],
    narration: 'Consulting services',
    totalAmount: 95000,
    createdAt: '2024-12-22T09:30:00Z',
  },
];

export const dashboardMetrics: DashboardMetrics = {
  totalSales: 1700000,
  totalPurchases: 1300000,
  totalReceivables: 522000,
  totalPayables: 400000,
  cashInHand: 125000,
  bankBalance: 1060000,
  todayTransactions: 5,
  pendingInvoices: 8,
};

export const stockItems: StockItem[] = [
  { id: '1', name: 'Steel Sheets (Grade A)', unit: 'Kg', quantity: 2500, rate: 85, value: 212500, group: 'Raw Materials' },
  { id: '2', name: 'Aluminum Bars', unit: 'Kg', quantity: 1200, rate: 210, value: 252000, group: 'Raw Materials' },
  { id: '3', name: 'Copper Wire', unit: 'Mtr', quantity: 5000, rate: 45, value: 225000, group: 'Raw Materials' },
  { id: '4', name: 'Finished Product A', unit: 'Nos', quantity: 150, rate: 2500, value: 375000, group: 'Finished Goods' },
  { id: '5', name: 'Finished Product B', unit: 'Nos', quantity: 85, rate: 4500, value: 382500, group: 'Finished Goods' },
  { id: '6', name: 'Packaging Material', unit: 'Box', quantity: 500, rate: 25, value: 12500, group: 'Consumables' },
];
