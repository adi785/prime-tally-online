import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'
import { toast } from 'sonner'
import { authService } from './auth'
import { companyService } from './services/companyService'
import { Company, CreateLedgerRequest, UpdateCompanyRequest, UpdateLedgerRequest, CreateStockItemRequest, UpdateStockItemRequest, CreateVoucherRequest, UpdateVoucherRequest, UserSettings, UpdateUserSettingsRequest, LedgerQueryParams, VoucherQueryParams } from './types'
import { ledgerService } from './services/ledgerService'
import { stockService } from './services/stockService'
import { voucherService } from './services/voucherService'
import { dashboardService } from './services/dashboardService'
import { reportService } from './services/reportService'
import { utilityService } from './services/utilityService'
import { settingsService } from './services/settingsService'

// Auth Hook
export const useAuthState = () => {
  const queryClient = useQueryClient()
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
    staleTime: Infinity,
  })

  const signOut = async () => {
    try {
      await authService.signOut()
      queryClient.setQueryData(['auth'], null)
      queryClient.clear()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  }
}

// Ledger Groups Hook (does not depend on userId, public access)
export const useLedgerGroups = () => {
  return useQuery({
    queryKey: ['ledgerGroups'],
    queryFn: async () => {
      const data = await ledgerService.getLedgerGroups();
      return data || []
    },
  })
}

// Ledger Hooks
export const useLedgers = (params?: LedgerQueryParams) => {
  const { user } = useAuthState();
  return useQuery({
    queryKey: ['ledgers', params], // Include params in query key
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await ledgerService.getLedgers(user.id, params);
      return data || []
    },
    enabled: !!user?.id,
  })
}

export const useCreateLedger = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthState();
  
  return useMutation({
    mutationFn: async (newLedger: CreateLedgerRequest) => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await ledgerService.createLedger(user.id, newLedger);
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] })
      toast.success('Ledger created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create ledger: ${error.message}`)
    },
    enabled: !!user?.id,
  })
}

export const useUpdateLedger = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthState();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateLedgerRequest) => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await ledgerService.updateLedger(user.id, id!, updates);
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] })
      toast.success('Ledger updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update ledger: ${error.message}`)
    },
    enabled: !!user?.id,
  })
}

export const useDeleteLedger = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthState();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      await ledgerService.deleteLedger(user.id, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] })
      toast.success('Ledger deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete ledger: ${error.message}`)
    },
    enabled: !!user?.id,
  })
}

// Voucher Types Hook (does not depend on userId, public access)
export const useVoucherTypes = () => {
  return useQuery({
    queryKey: ['voucherTypes'],
    queryFn: async () => {
      const data = await voucherService.getVoucherTypes();
      return data || []
    },
  })
}

// Voucher Hooks
export const useVouchers = (params?: VoucherQueryParams) => {
  const { user } = useAuthState();
  return useQuery({
    queryKey: ['vouchers', params], // Include params in query key
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await voucherService.getVouchers(user.id, params);
      return data || []
    },
    enabled: !!user?.id,
  })
}

export const useCreateVoucher = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthState();
  
  return useMutation({
    mutationFn: async (newVoucher: CreateVoucherRequest) => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await voucherService.createVoucher(user.id, newVoucher);
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] })
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
      toast.success('Voucher created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create voucher: ${error.message}`)
    },
    enabled: !!user?.id,
  })
}

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthState();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateVoucherRequest) => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await voucherService.updateVoucher(user.id, id!, updates);
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] })
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
      toast.success('Voucher updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update voucher: ${error.message}`)
    },
    enabled: !!user?.id,
  })
}

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthState();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      await voucherService.deleteVoucher(user.id, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] })
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
      toast.success('Voucher deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete voucher: ${error.message}`)
    },
    enabled: !!user?.id,
  })
}

// Dashboard Metrics Hook
export const useDashboardMetrics = () => {
  const { user } = useAuthState();
  return useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await dashboardService.getDashboardMetrics(user.id)
      return data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })
}

// Stock Items Hooks
export const useStockItems = () => {
  const { user } = useAuthState();
  return useQuery({
    queryKey: ['stockItems'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await stockService.getStockItems(user.id);
      return data || []
    },
    enabled: !!user?.id,
  })
}

export const useCreateStockItem = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthState();
  
  return useMutation({
    mutationFn: async (newStockItem: CreateStockItemRequest) => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await stockService.createStockItem(user.id, newStockItem);
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] })
      toast.success('Stock item created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create stock item: ${error.message}`)
    },
    enabled: !!user?.id,
  })
}

export const useUpdateStockItem = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthState();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateStockItemRequest) => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await stockService.updateStockItem(user.id, id!, updates);
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] })
      toast.success('Stock item updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update stock item: ${error.message}`)
    },
    enabled: !!user?.id,
  })
}

export const useDeleteStockItem = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthState();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      await stockService.deleteStockItem(user.id, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] })
      toast.success('Stock item deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete stock item: ${error.message}`)
    },
    enabled: !!user?.id,
  })
}

// Company Hooks
export const useCompany = () => {
  const { user } = useAuthState();
  return useQuery<Company | null, Error>({
    queryKey: ['company'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await companyService.getCompany(user.id)
      return data
    },
    enabled: !!user?.id,
    staleTime: Infinity,
  })
}

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthState();
  return useMutation<Company, Error, Omit<Company, 'id' | 'created_at' | 'updated_at' | 'user_id'>>({
    mutationFn: async (newCompany) => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await companyService.createCompany(user.id, newCompany);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Company created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create company: ${error.message}`);
    },
    enabled: !!user?.id,
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthState();
  
  return useMutation<Company, Error, UpdateCompanyRequest>({
    mutationFn: async (updates) => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await companyService.updateCompany(user.id, updates)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['company'] })
      toast.success('Company information updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update company information: ${error.message}`)
    },
    enabled: !!user?.id,
  })
}

// User Settings Hooks
export const useUserSettings = () => {
  const { user } = useAuthState();
  return useQuery<UserSettings | null, Error>({
    queryKey: ['userSettings'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await settingsService.getUserSettings(user.id);
      return data;
    },
    enabled: !!user?.id,
    staleTime: Infinity,
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthState();
  return useMutation<UserSettings, Error, UpdateUserSettingsRequest>({
    mutationFn: async (updates) => {
      if (!user?.id) throw new Error('User not authenticated');
      const data = await settingsService.updateUserSettings(user.id, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
    enabled: !!user?.id,
  });
};


// Report Hooks
export const useBalanceSheet = () => {
  const { user } = useAuthState();
  return useQuery({
    queryKey: ['balanceSheet'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return reportService.getBalanceSheet(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProfitAndLoss = () => {
  const { user } = useAuthState();
  return useQuery({
    queryKey: ['profitLoss'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return reportService.getProfitAndLoss(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTrialBalance = () => {
  const { user } = useAuthState();
  return useQuery({
    queryKey: ['trialBalance'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return reportService.getTrialBalance(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDayBook = (params: { startDate: string; endDate: string; type?: string }) => {
  const { user } = useAuthState();
  return useQuery({
    queryKey: ['dayBook', params],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return reportService.getDayBook(user.id, params);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};