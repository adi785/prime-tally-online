import { supabase } from './client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Ledger, Voucher, DashboardMetrics, StockItem, Company } from '@/types/tally';
import { useState, useEffect } from 'react';

// Ledger hooks
export const useLedgers = () => {
  return useQuery({
    queryKey: ['ledgers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ledgers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateLedger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ledger: Omit<Ledger, 'id' | 'currentBalance'>) => {
      const { data, error } = await supabase
        .from('ledgers')
        .insert([{
          name: ledger.name,
          group: ledger.group,
          opening_balance: ledger.openingBalance,
          address: ledger.address,
          phone: ledger.phone,
          gstin: ledger.gstin,
          email: ledger.email,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
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
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Ledger>) => {
      const { data: updatedData, error } = await supabase
        .from('ledgers')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedData;
    },
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ledgers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vouchers')
        .select(`
          *,
          items: voucher_items(*)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (voucher: Omit<Voucher, 'id' | 'createdAt'>) => {
      // Insert voucher
      const { data: voucherData, error: voucherError } = await supabase
        .from('vouchers')
        .insert([{
          voucher_number: voucher.voucherNumber,
          type: voucher.type,
          date: voucher.date,
          party_ledger_id: voucher.partyLedgerId,
          narration: voucher.narration,
          total_amount: voucher.totalAmount,
        }])
        .select()
        .single();
      
      if (voucherError) throw voucherError;

      // Insert items
      const itemsData = voucher.items.map(item => ({
        voucher_id: voucherData.id,
        ledger_id: item.ledgerId,
        amount: item.amount,
        type: item.type,
      }));

      const { error: itemsError } = await supabase
        .from('voucher_items')
        .insert(itemsData);
      
      if (itemsError) throw itemsError;

      return { ...voucherData, items: itemsData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
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
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Voucher>) => {
      const { data: updatedData, error } = await supabase
        .from('vouchers')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
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
    mutationFn: async (id: string) => {
      // Delete items first
      const { error: itemsError } = await supabase
        .from('voucher_items')
        .delete()
        .eq('voucher_id', id);
      
      if (itemsError) throw itemsError;

      // Delete voucher
      const { error: voucherError } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', id);
      
      if (voucherError) throw voucherError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
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
    queryFn: async () => {
      // Get total sales
      const { data: salesData } = await supabase
        .from('vouchers')
        .select('total_amount')
        .eq('type', 'sales');
      
      // Get total purchases
      const { data: purchasesData } = await supabase
        .from('vouchers')
        .select('total_amount')
        .eq('type', 'purchase');
      
      // Get receivables (sundry debtors)
      const { data: debtorsData } = await supabase
        .from('ledgers')
        .select('current_balance')
        .eq('group', 'sundry-debtors');
      
      // Get payables (sundry creditors)
      const { data: creditorsData } = await supabase
        .from('ledgers')
        .select('current_balance')
        .eq('group', 'sundry-creditors');
      
      // Get cash and bank balances
      const { data: cashData } = await supabase
        .from('ledgers')
        .select('current_balance')
        .in('group', ['cash-in-hand', 'bank-accounts']);

      return {
        totalSales: salesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0,
        totalPurchases: purchasesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0,
        totalReceivables: debtorsData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
        totalPayables: creditorsData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
        cashInHand: cashData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
        bankBalance: cashData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
        todayTransactions: 0, // Would need to calculate based on today's date
        pendingInvoices: 0, // Would need to calculate based on payment status
      };
    },
  });
};

// Stock hooks
export const useStockItems = () => {
  return useQuery({
    queryKey: ['stock-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateStockItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (stockItem: Omit<StockItem, 'id'>) => {
      const { data, error } = await supabase
        .from('stock_items')
        .insert([{
          name: stockItem.name,
          unit: stockItem.unit,
          quantity: stockItem.quantity,
          rate: stockItem.rate,
          value: stockItem.value,
          group_name: stockItem.group,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (company: Company) => {
      const { data, error } = await supabase
        .from('companies')
        .update(company)
        .eq('id', company.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
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

// Authentication hook
export const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
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