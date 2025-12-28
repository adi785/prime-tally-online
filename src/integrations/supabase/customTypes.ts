// Custom types for the application that extend Supabase types

// Ledger Types
export interface Ledger {
  id: string;
  name: string;
  group_name: string;
  group_id?: string;
  group?: string;
  opening_balance: number;
  current_balance: number;
  address?: string | null;
  phone?: string | null;
  gstin?: string | null;
  email?: string | null;
  is_billwise?: boolean | null;
  is_inventory?: boolean | null;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLedgerRequest {
  name: string;
  group_id: string;
  opening_balance?: number;
  address?: string;
  phone?: string;
  gstin?: string;
  email?: string;
  is_billwise?: boolean;
  is_inventory?: boolean;
}

export interface UpdateLedgerRequest {
  id: string;
  name?: string;
  group_id?: string;
  opening_balance?: number;
  address?: string;
  phone?: string;
  gstin?: string;
  email?: string;
  is_billwise?: boolean;
  is_inventory?: boolean;
}

export interface LedgerQueryParams {
  search?: string;
  groupId?: string;
}

// Voucher Types
export interface VoucherItem {
  id: string;
  voucher_id: string;
  ledger_id?: string | null;
  ledger?: { id: string; name: string } | null;
  particulars?: string | null;
  type: string;
  amount: number;
  created_at: string;
}

export interface Voucher {
  id: string;
  voucher_number: string;
  type?: { id: string; name: string } | null;
  type_id?: string;
  date: string;
  party_ledger_id?: string | null;
  party_name: string;
  party?: { id: string; name: string } | null;
  total_amount: number;
  narration?: string | null;
  items?: VoucherItem[];
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVoucherRequest {
  voucher_number: string;
  type_id: string;
  date: string;
  party_ledger_id?: string;
  narration?: string;
  items: Array<{
    ledger_id: string;
    type: 'debit' | 'credit';
    amount: number;
    particulars?: string;
  }>;
}

export interface UpdateVoucherRequest {
  id: string;
  voucher_number?: string;
  type_id?: string;
  date?: string;
  party_ledger_id?: string;
  narration?: string;
  items?: Array<{
    id?: string;
    ledger_id: string;
    type: 'debit' | 'credit';
    amount: number;
    particulars?: string;
  }>;
}

export interface VoucherQueryParams {
  type?: string;
  startDate?: string;
  endDate?: string;
}

// Stock Types
export interface StockItem {
  id: string;
  name: string;
  group_name: string;
  unit: string;
  quantity: number;
  rate: number;
  value: number;
  reorder_level?: number | null;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStockItemRequest {
  name: string;
  group_name?: string;
  unit?: string;
  quantity?: number;
  rate?: number;
  reorder_level?: number;
}

export interface UpdateStockItemRequest {
  id: string;
  name?: string;
  group_name?: string;
  unit?: string;
  quantity?: number;
  rate?: number;
  reorder_level?: number;
}

export interface StockQueryParams {
  search?: string;
  group?: string;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  gstin?: string | null;
  pan?: string | null;
  financial_year_start?: string | null;
  financial_year_end?: string | null;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
  gstin?: string;
  pan?: string;
  financial_year_start?: string;
  financial_year_end?: string;
}

// User Settings Types
export interface UserSettings {
  id: string;
  user_id: string;
  theme?: string;
  language?: string;
  date_format?: string;
  currency_format?: string;
  notifications_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserSettingsRequest {
  id: string;
  theme?: string;
  language?: string;
  date_format?: string;
  currency_format?: string;
  notifications_enabled?: boolean;
}

// Report Types
export interface BalanceSheetData {
  assets: Array<{
    category: string;
    items: Array<{ name: string; amount: number }>;
    total: number;
  }>;
  liabilities: Array<{
    category: string;
    items: Array<{ name: string; amount: number }>;
    total: number;
  }>;
  equity: Array<{
    category: string;
    items: Array<{ name: string; amount: number }>;
    total: number;
  }>;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface ProfitLossData {
  income: Array<{
    category: string;
    items: Array<{ name: string; amount: number }>;
    total: number;
  }>;
  expenses: Array<{
    category: string;
    items: Array<{ name: string; amount: number }>;
    total: number;
  }>;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export interface TrialBalanceData {
  entries: Array<{
    name: string;
    group: string;
    debit: number;
    credit: number;
  }>;
  totalDebit: number;
  totalCredit: number;
}

export interface DayBookEntry {
  id: string;
  date: string;
  voucher_number: string;
  type: string;
  party_name: string;
  debit: number;
  credit: number;
  narration?: string;
}

// Dashboard Types
export interface DashboardMetrics {
  totalLedgers: number;
  totalVouchers: number;
  totalSales: number;
  totalPurchases: number;
  totalReceipts: number;
  totalPayments: number;
  cashBalance: number;
  bankBalance: number;
  receivables: number;
  payables: number;
}
