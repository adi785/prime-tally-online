import { nhost } from './client';
import { 
  Ledger, 
  Voucher, 
  DashboardMetrics, 
  StockItem, 
  Company,
  CreateLedgerRequest,
  UpdateLedgerRequest,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  CreateStockItemRequest,
  UpdateStockItemRequest,
  UpdateCompanyRequest,
  LedgerQueryParams,
  VoucherQueryParams,
  StockQueryParams,
  ApiResponse,
  PaginatedResponse,
  DashboardMetricsResponse
} from './types';

const API_BASE_URL = `${import.meta.env.VITE_NHOST_BACKEND_URL}/api/v1`;

class ApiService {
  private getHeaders() {
    const token = nhost.auth.getJWTToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Ledger services
  async getLedgers(params?: LedgerQueryParams): Promise<PaginatedResponse<Ledger>> {
    const url = new URL(`${API_BASE_URL}/ledgers`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<PaginatedResponse<Ledger>>(response);
  }

  async getLedger(id: string): Promise<Ledger> {
    const response = await fetch(`${API_BASE_URL}/ledgers/${id}`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Ledger>(response);
  }

  async createLedger(data: CreateLedgerRequest): Promise<Ledger> {
    const response = await fetch(`${API_BASE_URL}/ledgers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<Ledger>(response);
  }

  async updateLedger(id: string, data: UpdateLedgerRequest): Promise<Ledger> {
    const response = await fetch(`${API_BASE_URL}/ledgers/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<Ledger>(response);
  }

  async deleteLedger(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ledgers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    await this.handleResponse(response);
  }

  // Voucher services
  async getVouchers(params?: VoucherQueryParams): Promise<PaginatedResponse<Voucher>> {
    const url = new URL(`${API_BASE_URL}/vouchers`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<PaginatedResponse<Voucher>>(response);
  }

  async getVoucher(id: string): Promise<Voucher> {
    const response = await fetch(`${API_BASE_URL}/vouchers/${id}`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Voucher>(response);
  }

  async createVoucher(data: CreateVoucherRequest): Promise<Voucher> {
    const response = await fetch(`${API_BASE_URL}/vouchers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<Voucher>(response);
  }

  async updateVoucher(id: string, data: UpdateVoucherRequest): Promise<Voucher> {
    const response = await fetch(`${API_BASE_URL}/vouchers/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<Voucher>(response);
  }

  async deleteVoucher(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/vouchers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    await this.handleResponse(response);
  }

  // Dashboard services
  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    const response = await fetch(`${API_BASE_URL}/dashboard/metrics`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<DashboardMetricsResponse>(response);
  }

  // Stock services
  async getStockItems(params?: StockQueryParams): Promise<PaginatedResponse<StockItem>> {
    const url = new URL(`${API_BASE_URL}/stock-items`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<PaginatedResponse<StockItem>>(response);
  }

  async getStockItem(id: string): Promise<StockItem> {
    const response = await fetch(`${API_BASE_URL}/stock-items/${id}`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<StockItem>(response);
  }

  async createStockItem(data: CreateStockItemRequest): Promise<StockItem> {
    const response = await fetch(`${API_BASE_URL}/stock-items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<StockItem>(response);
  }

  async updateStockItem(id: string, data: UpdateStockItemRequest): Promise<StockItem> {
    const response = await fetch(`${API_BASE_URL}/stock-items/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<StockItem>(response);
  }

  async deleteStockItem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/stock-items/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    await this.handleResponse(response);
  }

  // Company services
  async getCompany(): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/company`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Company>(response);
  }

  async updateCompany(data: UpdateCompanyRequest): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/company`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<Company>(response);
  }

  // Utility services
  async searchLedgers(query: string): Promise<Ledger[]> {
    const url = new URL(`${API_BASE_URL}/ledgers/search`);
    url.searchParams.append('q', query);
    
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Ledger[]>(response);
  }

  async getVoucherTypes(): Promise<Array<{ id: string; name: string }>> {
    const response = await fetch(`${API_BASE_URL}/voucher-types`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Array<{ id: string; name: string }>>(response);
  }

  async getLedgerGroups(): Promise<Array<{ id: string; name: string }>> {
    const response = await fetch(`${API_BASE_URL}/ledger-groups`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Array<{ id: string; name: string }>>(response);
  }

  // Report services
  async getBalanceSheet(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/reports/balance-sheet`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<any>(response);
  }

  async getProfitAndLoss(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/reports/profit-loss`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<any>(response);
  }

  async getTrialBalance(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/reports/trial-balance`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<any>(response);
  }

  async getDayBook(params: { startDate: string; endDate: string }): Promise<any> {
    const url = new URL(`${API_BASE_URL}/reports/day-book`);
    url.searchParams.append('startDate', params.startDate);
    url.searchParams.append('endDate', params.endDate);
    
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<any>(response);
  }
}

export const apiService = new ApiService();