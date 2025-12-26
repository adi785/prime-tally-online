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
  opening_balance: number;
  current_balance: number;
  address?: string;
  phone?: string;
  gstin?: string;
  email?: string;
  is_billwise?: boolean;
  is_inventory?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VoucherItem {
  id: string;
  particulars?: string;
  ledger_id: string;
  amount: number;
  type: 'debit' | 'credit';
  created_at?: string;
}

export interface Voucher {
  id: string;
  voucher_number: string;
  type: VoucherType;
  date: string;
  party_name?: string;
  party_ledger_id: string;
  items: VoucherItem[];
  narration?: string;
  total_amount: number;
  created_at?: string;
  updated_at?: string;
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
  group_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  gstin: string;
  pan: string;
  phone?: string;
  email?: string;
  financial_year_start: string;
  financial_year_end: string;
  created_at?: string;
  updated_at?: string;
}