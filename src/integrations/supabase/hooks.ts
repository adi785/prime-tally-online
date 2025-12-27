import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'
import { toast } from 'sonner'
import { authService } from './auth'
import { companyService } from './services/companyService'
import { Company, CreateLedgerRequest, UpdateCompanyRequest, UpdateLedgerRequest, CreateStockItemRequest, UpdateStockItemRequest, CreateVoucherRequest, UpdateVoucherRequest, UserSettings, UpdateUserSettingsRequest } from './types'
import { ledgerService } from './services/ledgerService'
import { stockService } from './services/stockService'
import { voucherService } from './services/voucherService'
import { dashboardService } from './services/dashboardService'
import { reportService } from './services/reportService'
import { utilityService } from './services/utilityService'
import { settingsService } from './services/settingsService' // Import settingsService

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
      queryClient.clear() // Clear all queries on sign out
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

// Ledger Groups Hook
export const useLedgerGroups = () => {
  return useQuery({
    queryKey: ['ledgerGroups'],
    queryFn: async () => {
      const data = await ledgerService.getLedgerGroups(); // Use service
      return data || []
    },
  })
}

// Ledger Hooks
export const useLedgers = () => {
  return useQuery({
    queryKey: ['ledgers'],
    queryFn: async () => {
      const data = await ledgerService.getLedgers(); // Use service
      return data || []
    },
  })
}

export const useCreateLedger = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newLedger: CreateLedgerRequest) => {
      const data = await ledgerService.createLedger(newLedger); // Use service
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] }) // Invalidate dashboard metrics as ledgers affect them
      toast.success('Ledger created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create ledger: ${error.message}`)
    },
  })
}

export const useUpdateLedger = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateLedgerRequest) => {
      const data = await ledgerService.updateLedger(id!, updates); // Use service
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] }) // Invalidate dashboard metrics as ledgers affect them
      toast.success('Ledger updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update ledger: ${error.message}`)
    },
  })
}

export const useDeleteLedger = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await ledgerService.deleteLedger(id); // Use service
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] }) // Invalidate dashboard metrics as ledgers affect them
      toast.success('Ledger deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete ledger: ${error.message}`)
    },
  })
}

// Voucher Types Hook
export const useVoucherTypes = () => {
  return useQuery({
    queryKey: ['voucherTypes'],
    queryFn: async () => {
      const data = await voucherService.getVoucherTypes(); // Use service
      return data || []
    },
  })
}

// Voucher Hooks
export const useVouchers = () => {
  return useQuery({
    queryKey: ['vouchers'],
    queryFn: async () => {
      const data = await voucherService.getVouchers(); // Use service
      return data || []
    },
  })
}

export const useCreateVoucher = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newVoucher: CreateVoucherRequest) => {
      const data = await voucherService.createVoucher(newVoucher); // Use service
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] }) // Invalidate dashboard metrics as vouchers affect them
      queryClient.invalidateQueries({ queryKey: ['ledgers'] }) // Vouchers update ledger balances
      toast.success('Voucher created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create voucher: ${error.message}`)
    },
  })
}

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateVoucherRequest) => {
      const data = await voucherService.updateVoucher(id!, updates); // Use service
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] }) // Invalidate dashboard metrics as vouchers affect them
      queryClient.invalidateQueries({ queryKey: ['ledgers'] }) // Vouchers update ledger balances
      toast.success('Voucher updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update voucher: ${error.message}`)
    },
  })
}

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await voucherService.deleteVoucher(id); // Use service
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] }) // Invalidate dashboard metrics as vouchers affect them
      queryClient.invalidateQueries({ queryKey: ['ledgers'] }) // Vouchers update ledger balances
      toast.success('Voucher deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete voucher: ${error.message}`)
    },
  })
}

// Dashboard Metrics Hook
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const data = await dashboardService.getDashboardMetrics() // Use service
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Stock Items Hooks
export const useStockItems = () => {
  return useQuery({
    queryKey: ['stockItems'],
    queryFn: async () => {
      const data = await stockService.getStockItems(); // Use service
      return data || []
    },
  })
}

export const useCreateStockItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newStockItem: CreateStockItemRequest) => {
      const data = await stockService.createStockItem(newStockItem); // Use service
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] })
      toast.success('Stock item created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create stock item: ${error.message}`)
    },
  })
}

export const useUpdateStockItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateStockItemRequest) => {
      const data = await stockService.updateStockItem(id!, updates); // Use service
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] })
      toast.success('Stock item updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update stock item: ${error.message}`)
    },
  })
}

export const useDeleteStockItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await stockService.deleteStockItem(id); // Use service
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] })
      toast.success('Stock item deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete stock item: ${error.message}`)
    },
  })
}

// Company Hooks
export const useCompany = () => {
  return useQuery<Company | null, Error>({
    queryKey: ['company'],
    queryFn: async () => {
      const data = await companyService.getCompany()
      return data
    },
    staleTime: Infinity, // Company info doesn't change often
  })
}

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation<Company, Error, Omit<Company, 'id' | 'created_at' | 'updated_at' | 'user_id'>>({
    mutationFn: async (newCompany) => {
      const data = await companyService.createCompany(newCompany);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Company created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create company: ${error.message}`);
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient()
  
  return useMutation<Company, Error, UpdateCompanyRequest>({
    mutationFn: async (updates) => {
      const data = await companyService.updateCompany(updates)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['company'] })
      toast.success('Company information updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update company information: ${error.message}`)
    },
  })
}

// User Settings Hooks
export const useUserSettings = () => {
  return useQuery<UserSettings | null, Error>({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const data = await settingsService.getUserSettings();
      return data;
    },
    staleTime: Infinity, // Settings don't change often
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<UserSettings, Error, UpdateUserSettingsRequest>({
    mutationFn: async (updates) => {
      const data = await settingsService.updateUserSettings(updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });
};


// Report Hooks
export const useBalanceSheet = () => {
  return useQuery({
    queryKey: ['balanceSheet'],
    queryFn: async () => reportService.getBalanceSheet(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProfitAndLoss = () => {
  return useQuery({
    queryKey: ['profitLoss'],
    queryFn: async () => reportService.getProfitAndLoss(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTrialBalance = () => {
  return useQuery({
    queryKey: ['trialBalance'],
    queryFn: async () => reportService.getTrialBalance(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDayBook = (params: { startDate: string; endDate: string }) => {
  return useQuery({
    queryKey: ['dayBook', params],
    queryFn: async () => reportService.getDayBook(params),
    staleTime: 5 * 60 * 1000,
  });
};