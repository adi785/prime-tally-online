import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './client';
import { toast } from 'sonner';
import { supabaseService } from './services';
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
  DashboardMetricsResponse
} from './types';

// --- Auth Hook ---

export const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setIsLoading(false);
      } catch (error) {
        console.warn('Auth check failed, assuming no user');
        setUser(null);
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };
};

// --- Ledger Hooks ---

export const useLedgers = (params?: LedgerQueryParams) => {
  return useQuery<Ledger[], Error>({
    queryKey: ['ledgers', params],
    queryFn: () => supabaseService.getLedgers(params),
  });
};

export const useLedger = (id: string) => {
  return useQuery<Ledger, Error>({
    queryKey: ['ledgers', id],
    queryFn: () => supabaseService.getLedger(id),
    enabled: !!id,
  });
};

export const useCreateLedger = () => {
  const queryClient = useQueryClient();
  return useMutation<Ledger, Error, CreateLedgerRequest>({
    mutationFn: (data) => supabaseService.createLedger(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Ledger created successfully.');
    },
    onError: (error) => {
      toast.error(`Failed to create ledger: ${error.message}`);
    },
  });
};

export const useUpdateLedger = () => {
  const queryClient = useQueryClient();
  return useMutation<Ledger, Error, UpdateLedgerRequest>({
    mutationFn: (data) => supabaseService.updateLedger(data.id, data),
    onSuccess: (updatedLedger) => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers', updatedLedger.id] });
      toast.success('Ledger updated successfully.');
    },
    onError: (error) => {
      toast.error(`Failed to update ledger: ${error.message}`);
    },
  });
};

export const useDeleteLedger = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => supabaseService.deleteLedger(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Ledger deleted successfully.');
    },
    onError: (error) => {
      toast.error(`Failed to delete ledger: ${error.message}`);
    },
  });
};

// --- Voucher Hooks ---

export const useVouchers = (params?: VoucherQueryParams) => {
  return useQuery<Voucher[], Error>({
    queryKey: ['vouchers', params],
    queryFn: () => supabaseService.getVouchers(params),
  });
};

export const useVoucher = (id: string) => {
  return useQuery<Voucher, Error>({
    queryKey: ['vouchers', id],
    queryFn: () => supabaseService.getVoucher(id),
    enabled: !!id,
  });
};

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation<Voucher, Error, CreateVoucherRequest>({
    mutationFn: (data) => supabaseService.createVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Voucher created successfully.');
    },
    onError: (error) => {
      toast.error(`Failed to create voucher: ${error.message}`);
    },
  });
};

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation<Voucher, Error, UpdateVoucherRequest>({
    mutationFn: (data) => supabaseService.updateVoucher(data.id, data),
    onSuccess: (updatedVoucher) => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['vouchers', updatedVoucher.id] });
      toast.success('Voucher updated successfully.');
    },
    onError: (error) => {
      toast.error(`Failed to update voucher: ${error.message}`);
    },
  });
};

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => supabaseService.deleteVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Voucher deleted successfully.');
    },
    onError: (error) => {
      toast.error(`Failed to delete voucher: ${error.message}`);
    },
  });
};

// --- Dashboard Hooks ---

export const useDashboardMetrics = () => {
  return useQuery<DashboardMetricsResponse, Error>({
    queryKey: ['dashboardMetrics'],
    queryFn: () => supabaseService.getDashboardMetrics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// --- Stock Item Hooks ---

export const useStockItems = (params?: StockQueryParams) => {
  return useQuery<StockItem[], Error>({
    queryKey: ['stockItems', params],
    queryFn: () => supabaseService.getStockItems(params),
  });
};

export const useStockItem = (id: string) => {
  return useQuery<StockItem, Error>({
    queryKey: ['stockItems', id],
    queryFn: () => supabaseService.getStockItem(id),
    enabled: !!id,
  });
};

export const useCreateStockItem = () => {
  const queryClient = useQueryClient();
  return useMutation<StockItem, Error, CreateStockItemRequest>({
    mutationFn: (data) => supabaseService.createStockItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      toast.success('Stock item created successfully.');
    },
    onError: (error) => {
      toast.error(`Failed to create stock item: ${error.message}`);
    },
  });
};

export const useUpdateStockItem = () => {
  const queryClient = useQueryClient();
  return useMutation<StockItem, Error, UpdateStockItemRequest>({
    mutationFn: (data) => supabaseService.updateStockItem(data.id, data),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      queryClient.invalidateQueries({ queryKey: ['stockItems', updatedItem.id] });
      toast.success('Stock item updated successfully.');
    },
    onError: (error) => {
      toast.error(`Failed to update stock item: ${error.message}`);
    },
  });
};

export const useDeleteStockItem = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => supabaseService.deleteStockItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      toast.success('Stock item deleted successfully.');
    },
    onError: (error) => {
      toast.error(`Failed to delete stock item: ${error.message}`);
    },
  });
};

// --- Company Hooks ---

export const useCompany = () => {
  return useQuery<Company, Error>({
    queryKey: ['company'],
    queryFn: () => supabaseService.getCompany(),
    staleTime: Infinity,
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation<Company, Error, UpdateCompanyRequest>({
    mutationFn: (data) => supabaseService.updateCompany(data),
    onSuccess: (updatedCompany) => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Company information updated successfully.');
    },
    onError: (error) => {
      toast.error(`Failed to update company information: ${error.message}`);
    },
  });
};