import { Ledger, Voucher, DashboardMetrics, StockItem, Company } from '@/types/tally'

export const company: Company = {
  id: '1',
  name: 'ABC Enterprises Pvt. Ltd.',
  address: '123 Business Park, Mumbai, Maharashtra - 400001',
  gstin: '27AABCU9603R1ZM',
  pan: 'AABCU9603R',
  phone: '+91 22 2345 6789',
  email: 'info@abcenterprises.com',
  financial_year_start: '2024-04-01',
  financial_year_end: '2025-03-31',
  created_at: '2024-04-01T00:00:00Z',
  updated_at: '2024-12-26T10:00:00Z',
}

export const ledgers: Ledger[] = [
  { id: '1', name: 'Cash', group_name: 'cash-in-hand', opening_balance: 50000, current_balance: 125000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '2', name: 'HDFC Bank Current A/c', group_name: 'bank-accounts', opening_balance: 500000, current_balance: 875000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '3', name: 'ICICI Bank Savings', group_name: 'bank-accounts', opening_balance: 200000, current_balance: 185000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '4', name: 'Reliance Industries Ltd', group_name: 'sundry-debtors', opening_balance: 150000, current_balance: 285000, gstin: '27AABCR1234R1Z5', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '5', name: 'Tata Motors', group_name: 'sundry-debtors', opening_balance: 75000, current_balance: 142000, gstin: '27AABCT5678R1Z8', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '6', name: 'Infosys Technologies', group_name: 'sundry-debtors', opening_balance: 0, current_balance: 95000, gstin: '29AABCI1234R1Z2', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '7', name: 'Mahindra & Mahindra', group_name: 'sundry-creditors', opening_balance: -100000, current_balance: -175000, gstin: '27AABCM9012R1Z1', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '8', name: 'Larsen & Toubro', group_name: 'sundry-creditors', opening_balance: -50000, current_balance: -225000, gstin: '27AABCL3456R1Z4', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '9', name: 'Sales - Goods', group_name: 'sales-accounts', opening_balance: 0, current_balance: -1250000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '10', name: 'Sales - Services', group_name: 'sales-accounts', opening_balance: 0, current_balance: -450000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '11', name: 'Purchase - Raw Materials', group_name: 'purchase-accounts', opening_balance: 0, current_balance: 875000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '12', name: 'Purchase - Trading Goods', group_name: 'purchase-accounts', opening_balance: 0, current_balance: 425000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '13', name: 'Rent Expense', group_name: 'indirect-expenses', opening_balance: 0, current_balance: 120000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '14', name: 'Electricity Expense', group_name: 'indirect-expenses', opening_balance: 0, current_balance: 45000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '15', name: 'Salary Expense', group_name: 'indirect-expenses', opening_balance: 0, current_balance: 350000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '16', name: 'Office Equipment', group_name: 'fixed-assets', opening_balance: 250000, current_balance: 250000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '17', name: 'Furniture & Fixtures', group_name: 'fixed-assets', opening_balance: 150000, current_balance: 150000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '18', name: 'Interest Income', group_name: 'indirect-incomes', opening_balance: 0, current_balance: -25000, created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
]

export const vouchers: Voucher[] = [
  {
    id: '1',
    voucher_number: 'SV-001',
    type: 'sales',
    date: '2024-12-26',
    party_ledger_id: '4',
    items: [
      { id: '1', particulars: 'Sales - Goods', ledger_id: '9', amount: 135000, type: 'credit' },
    ],
    narration: 'Sale of finished goods',
    total_amount: 135000,
    created_at: '2024-12-26T10:30:00Z',
    updated_at: '2024-12-26T10:30:00Z',
  },
  {
    id: '2',
    voucher_number: 'PV-001',
    type: 'purchase',
    date: '2024-12-25',
    party_ledger_id: '7',
    items: [
      { id: '1', particulars: 'Purchase - Raw Materials', ledger_id: '11', amount: 75000, type: 'debit' },
    ],
    narration: 'Purchase of raw materials',
    total_amount: 75000,
    created_at: '2024-12-25T14:15:00Z',
    updated_at: '2024-12-25T14:15:00Z',
  },
  {
    id: '3',
    voucher_number: 'RV-001',
    type: 'receipt',
    date: '2024-12-24',
    party_ledger_id: '5',
    items: [
      { id: '1', particulars: 'HDFC Bank Current A/c', ledger_id: '2', amount: 50000, type: 'debit' },
    ],
    narration: 'Receipt against invoice',
    total_amount: 50000,
    created_at: '2024-12-24T11:00:00Z',
    updated_at: '2024-12-24T11:00:00Z',
  },
  {
    id: '4',
    voucher_number: 'PMT-001',
    type: 'payment',
    date: '2024-12-23',
    party_ledger_id: '8',
    items: [
      { id: '1', particulars: 'HDFC Bank Current A/c', ledger_id: '2', amount: 100000, type: 'credit' },
    ],
    narration: 'Payment for supplies',
    total_amount: 100000,
    created_at: '2024-12-23T16:45:00Z',
    updated_at: '2024-12-23T16:45:00Z',
  },
  {
    id: '5',
    voucher_number: 'SV-002',
    type: 'sales',
    date: '2024-12-22',
    party_ledger_id: '6',
    items: [
      { id: '1', particulars: 'Sales - Services', ledger_id: '10', amount: 95000, type: 'credit' },
    ],
    narration: 'Consulting services',
    total_amount: 95000,
    created_at: '2024-12-22T09:30:00Z',
    updated_at: '2024-12-22T09:30:00Z',
  },
]

export const dashboardMetrics: DashboardMetrics = {
  totalSales: 1700000,
  totalPurchases: 1300000,
  totalReceivables: 522000,
  totalPayables: 400000,
  cashInHand: 125000,
  bankBalance: 1060000,
  todayTransactions: 5,
  pendingInvoices: 8,
}

export const stockItems: StockItem[] = [
  { id: '1', name: 'Steel Sheets (Grade A)', unit: 'Kg', quantity: 2500, rate: 85, value: 212500, group_name: 'Raw Materials', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '2', name: 'Aluminum Bars', unit: 'Kg', quantity: 1200, rate: 210, value: 252000, group_name: 'Raw Materials', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '3', name: 'Copper Wire', unit: 'Mtr', quantity: 5000, rate: 45, value: 225000, group_name: 'Raw Materials', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '4', name: 'Finished Product A', unit: 'Nos', quantity: 150, rate: 2500, value: 375000, group_name: 'Finished Goods', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '5', name: 'Finished Product B', unit: 'Nos', quantity: 85, rate: 4500, value: 382500, group_name: 'Finished Goods', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
  { id: '6', name: 'Packaging Material', unit: 'Box', quantity: 500, rate: 25, value: 12500, group_name: 'Consumables', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-12-26T10:00:00Z' },
]