import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'
import { toast } from 'sonner'
import { authService } from './auth'

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
      const { data, error } = await supabase
        .from('ledger_groups')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data || []
    },
  })
}

// Ledger Hooks
export const useLedgers = () => {
  return useQuery({
    queryKey: ['ledgers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ledgers')
        .select(`
          *,
          group:ledger_groups(name)
        `)
        .order('name')
      
      if (error) throw error
      return data || []
    },
  })
}

export const useCreateLedger = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newLedger: any) => {
      const { data, error } = await supabase
        .from('ledgers')
        .insert([newLedger])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
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
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('ledgers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
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
      const { error } = await supabase
        .from('ledgers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
      toast.success('Ledger deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete ledger: ${error.message}`)
    },
  })
}

// Voucher Hooks
export const useVouchers = () => {
  return useQuery({
    queryKey: ['vouchers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vouchers')
        .select(`
          *,
          party_ledger:ledgers(name),
          voucher_items(*, ledger:ledgers(name))
        `)
        .order('date', { ascending: false })
      
      if (error) throw error
      return data || []
    },
  })
}

export const useCreateVoucher = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newVoucher: any) => {
      const { data, error } = await supabase
        .from('vouchers')
        .insert([newVoucher])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
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
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('vouchers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
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
      const { error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
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
      const { data, error } = await supabase.rpc('get_dashboard_metrics')
      if (error) throw error
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
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data || []
    },
  })
}

export const useCreateStockItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newStockItem: any) => {
      const { data, error } = await supabase
        .from('stock_items')
        .insert([newStockItem])
        .select()
        .single()
      
      if (error) throw error
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
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('stock_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
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
      const { error } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
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