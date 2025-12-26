import { Ledger, Voucher, DashboardMetrics, StockItem, Company } from '@/types/tally';

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
export interface CreateLedgerRequest {
  name: string;
  group: string;
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
export interface DashboardMetricsResponse extends DashboardMetrics {
  period: {
    start: string;
    end: string;
  };
}

// Stock API types
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