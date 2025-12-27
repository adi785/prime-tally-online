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

// Ledger API types
export interface Ledger {
  id: string;
  name: string;
  group_name: string;
  group_id: string;
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
  group?: {
    name: string;
  };
}

export interface CreateLedgerRequest {
  name: string;
  group: string;
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

// Voucher API types
export interface VoucherItem {
  id: string;
  particulars?: string;
  ledger_id: string;
  ledger?: {
    name: string;
  };
  amount: number;
  type: 'debit' | 'credit';
  created_at?: string;
}

export interface Voucher {
  id: string;
  voucher_number: string;
  type_id: string;
  type?: {
    name: string;
  };
  date: string;
  party_ledger_id: string;
  party?: {
    name: string;
  };
  items: VoucherItem[];
  narration?: string;
  total_amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVoucherRequest {
  voucher_number?: string;
  type_id: string;
  date: string;
  party_ledger_id: string;
  narration?: string;
  items: Array<{
    ledger_id: string;
    amount: number;
    type: 'debit' | 'credit';
  }>;
}

export interface UpdateVoucherRequest extends Partial<CreateVoucherRequest> {
  id: string;
}

// Dashboard API types
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

export interface DashboardMetricsResponse extends DashboardMetrics {
  period: {
    start: string;
    end: string;
  };
}

// Stock API types
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

// Company API types
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

export interface UpdateCompanyRequest extends Partial<Company> {
  id: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

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

export interface LedgerRealTimeEvent extends RealTimeEvent<Ledger> {
  table: 'ledgers';
}

export interface VoucherRealTimeEvent extends RealTimeEvent<Voucher> {
  table: 'vouchers';
}

export interface StockRealTimeEvent extends RealTimeEvent<StockItem> {
  table: 'stock_items';
}