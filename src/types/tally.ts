export type VoucherType = 
  | 'sales' 
  | 'purchase' 
  | 'payment' 
  | 'receipt' 
  | 'journal' 
  | 'contra' 
  | 'credit-note' 
  | 'debit-note';

export type LedgerGroup = 
  | 'sundry-debtors' 
  | 'sundry-creditors' 
  | 'bank-accounts' 
  | 'cash-in-hand' 
  | 'sales-accounts' 
  | 'purchase-accounts' 
  | 'direct-expenses' 
  | 'indirect-expenses' 
  | 'direct-incomes' 
  | 'indirect-incomes'
  | 'fixed-assets'
  | 'current-assets'
  | 'current-liabilities'
  | 'capital-account';

export interface Ledger {
  id: string;
  name: string;
  group: LedgerGroup;
  openingBalance: number;
  currentBalance: number;
  address?: string;
  phone?: string;
  gstin?: string;
  email?: string;
}

export interface VoucherItem {
  id: string;
  particulars: string;
  ledgerId: string;
  amount: number;
  type: 'debit' | 'credit';
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  type: VoucherType;
  date: string;
  partyName: string;
  partyLedgerId: string;
  items: VoucherItem[];
  narration?: string;
  totalAmount: number;
  createdAt: string;
}

export interface DashboardMetrics {
  totalSales: number;
  totalPurchases: number;
  totalReceivables: number;
  totalPayables: number;
  cashInHand: number;
  bankBalance: number;
  todayTransactions: number;
  pendingInvoices: number;
}

export interface StockItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  rate: number;
  value: number;
  group: string;
}

export interface Company {
  name: string;
  address: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  financialYearStart: string;
  financialYearEnd: string;
}
