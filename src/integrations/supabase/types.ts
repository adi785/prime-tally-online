import { Ledger, Voucher, DashboardMetrics, StockItem, Company, VoucherType, LedgerGroup } from '@/types/tally';

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Database table types
export interface DbLedger {
  id: string;
  name: string;
  group_id: string;
  opening_balance: number;
  current_balance: number;
  address?: string;
  phone?: string;
  gstin?: string;
  email?: string;
  is_billwise: boolean;
  is_inventory: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbVoucher {
  id: string;
  voucher_number: string;
  type_id: string;
  date: string;
  party_ledger_id: string;
  narration?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface DbVoucherItem {
  id: string;
  voucher_id: string;
  ledger_id: string;
  amount: number;
  type: 'debit' | 'credit';
  created_at: string;
}

export interface DbStockItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  rate: number;
  value: number;
  group_name: string;
  created_at: string;
  updated_at: string;
}

export interface DbCompany {
  id: string;
  name: string;
  address: string;
  gstin: string;
  pan: string;
  phone?: string;
  email?: string;
  financial_year_start: string;
  financial_year_end: string;
  created_at: string;
  updated_at: string;
}

export interface DbLedgerGroup {
  id: string;
  name: string;
  created_at: string;
}

export interface DbVoucherType {
  id: string;
  name: string;
  created_at: string;
}

// Request types
export interface CreateLedgerRequest {
  name: string;
  group_id: string;
  opening_balance: number;
  address?: string;
  phone?: string;
  gstin?: string;
  email?: string;
  is_billwise?: boolean;
  is_inventory?: boolean;
}

export interface UpdateLedgerRequest extends Partial<CreateLedgerRequest> {
  id: string;
}

export interface CreateVoucherRequest {
  voucher_number?: string;
  type_id: string;
  date: string;
  party_ledger_id: string;
  narration?: string;
  total_amount: number;
  items: Array<{
    ledger_id: string;
    amount: number;
    type: 'debit' | 'credit';
  }>;
}

export interface UpdateVoucherRequest extends Partial<CreateVoucherRequest> {
  id: string;
}

export interface CreateStockItemRequest {
  name: string;
  unit: string;
  quantity: number;
  rate: number;
  value: number;
  group_name: string;
}

export interface UpdateStockItemRequest extends Partial<CreateStockItemRequest> {
  id: string;
}

export interface UpdateCompanyRequest extends Partial<Company> {
  id: string;
}

// Authentication types
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest extends SignInRequest {
  displayName?: string;
  metadata?: Record<string, any>;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  newPassword: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ValidationError extends ApiError {
  field: string;
  value: any;
}

// Query types
export interface LedgerQueryParams {
  search?: string;
  group?: string;
  page?: number;
  limit?: number;
}

export interface VoucherQueryParams {
  type?: string;
  startDate?: string;
  endDate?: string;
  party?: string;
  page?: number;
  limit?: number;
}

export interface StockQueryParams {
  search?: string;
  group?: string;
  page?: number;
  limit?: number;
}

// WebSocket types (for real-time updates)
export interface RealTimeEvent<T> {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: T;
  timestamp: string;
}

export interface LedgerRealTimeEvent extends RealTimeEvent<DbLedger> {
  table: 'ledgers';
}

export interface VoucherRealTimeEvent extends RealTimeEvent<DbVoucher> {
  table: 'vouchers';
}

export interface VoucherItemRealTimeEvent extends RealTimeEvent<DbVoucherItem> {
  table: 'voucher_items';
}

export interface StockRealTimeEvent extends RealTimeEvent<DbStockItem> {
  table: 'stock_items';
}

export interface CompanyRealTimeEvent extends RealTimeEvent<DbCompany> {
  table: 'company_info';
}

// Dashboard types
export interface DashboardMetricsResponse extends DashboardMetrics {
  period: {
    start: string;
    end: string;
  };
}

// Report types
export interface BalanceSheetReport {
  assets: Array<{
    name: string;
    amount: number;
    group: string;
  }>;
  liabilities: Array<{
    name: string;
    amount: number;
    group: string;
  }>;
  equity: Array<{
    name: string;
    amount: number;
  }>;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface ProfitAndLossReport {
  income: Array<{
    name: string;
    amount: number;
  }>;
  expenses: Array<{
    name: string;
    amount: number;
  }>;
  grossProfit: number;
  netProfit: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface TrialBalanceReport {
  ledgers: Array<{
    name: string;
    group: string;
    debit: number;
    credit: number;
  }>;
  totalDebit: number;
  totalCredit: number;
}

export interface DayBookReport {
  transactions: Array<{
    date: string;
    voucherNumber: string;
    particulars: string;
    debit: number;
    credit: number;
  }>;
  totalDebit: number;
  totalCredit: number;
}

// Utility types
export type TableNames = 'ledgers' | 'vouchers' | 'voucher_items' | 'stock_items' | 'company_info';

export type EventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SubscriptionOptions {
  table: TableNames;
  event?: EventType;
  filter?: string;
}

// Migration types
export interface Migration {
  version: string;
  description: string;
  up: string;
  down: string;
  createdAt: string;
}