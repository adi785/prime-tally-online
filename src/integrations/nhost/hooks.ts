import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Ledger, Voucher, DashboardMetrics, StockItem, Company } from '@/types/tally';

// Base API functions
const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${import.meta.env.VITE_NHOST_BACKEND_URL}/api/v1/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_NHOST_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${import.meta.env.VITE_NHOST_BACKEND_URL}/api/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_NHOST_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${import.meta.env.VITE_NHOST_BACKEND_URL}/api/v1/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_NHOST_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${import.meta.env.VITE_NHOST_BACKEND_URL}/api/v1/${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_NHOST_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};

// Ledger hooks
export const useLedgers = () => {
  return useQuery({
    queryKey: ['ledgers'],
    queryFn: () => api.get<Ledger[]>('ledgers'),
  });
};

export const useCreateLedger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ledger: Omit<Ledger, 'id' | 'currentBalance'>) => 
      api.post<Ledger>('ledgers', ledger),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      toast.success('Ledger created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create ledger');
      console.error('Create ledger error:', error);
    },
  });
};

export const useUpdateLedger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Omit<Ledger, 'id' | 'currentBalance'>) => 
      api.put<Ledger>(`ledgers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      toast.success('Ledger updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update ledger');
      console.error('Update ledger error:', error);
    },
  });
};

export const useDeleteLedger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`ledgers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      toast.success('Ledger deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete ledger');
      console.error('Delete ledger error:', error);
    },
  });
};

// Voucher hooks
export const useVouchers = () => {
  return useQuery({
    queryKey: ['vouchers'],
    queryFn: () => api.get<Voucher[]>('vouchers'),
  });
};

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (voucher: Omit<Voucher, 'id' | 'createdAt'>) => 
      api.post<Voucher>('vouchers', voucher),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Voucher created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create voucher');
      console.error('Create voucher error:', error);
    },
  });
};

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Omit<Voucher, 'id' | 'createdAt'>) => 
      api.put<Voucher>(`vouchers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Voucher updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update voucher');
      console.error('Update voucher error:', error);
    },
  });
};

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`vouchers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Voucher deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete voucher');
      console.error('Delete voucher error:', error);
    },
  });
};

// Dashboard hooks
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardMetrics>('dashboard/metrics'),
  });
};

// Stock hooks
export const useStockItems = () => {
  return useQuery({
    queryKey: ['stock-items'],
    queryFn: () => api.get<StockItem[]>('stock-items'),
  });
};

export const useCreateStockItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (stockItem: Omit<StockItem, 'id'>) => 
      api.post<StockItem>('stock-items', stockItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      toast.success('Stock item created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create stock item');
      console.error('Create stock item error:', error);
    },
  });
};

// Company hooks
export const useCompany = () => {
  return useQuery({
    queryKey: ['company'],
    queryFn: () => api.get<Company>('company'),
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (company: Company) => api.put<Company>('company', company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Company information updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update company information');
      console.error('Update company error:', error);
    },
  });
};