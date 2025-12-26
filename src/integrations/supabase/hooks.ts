import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from './client';
import { Ledger, Voucher, DashboardMetrics, StockItem, Company } from '@/types/tally';

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
    enabled: !!supabase.auth.getUser(),
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
    mutationFn: async ({ id, ...data }: { id: string } & Omit<Ledger, 'id' | 'currentBalance'>) => {
      const { data: updatedData, error } = await supabase
        .from('ledgers')
        .update({
          name: data.name,
          group: data.group,
          opening_balance: data.openingBalance,
          address: data.address,
          phone: data.phone,
          gstin: data.gstin,
          email: data.email,
        })
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
    enabled: !!supabase.auth.getUser(),
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

      // Insert voucher items
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

      return voucherData;
    },
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
      
      // Get ledger balances
      const { data: ledgersData } = await supabase
        .from('ledgers')
        .select('current_balance');
      
      const totalSales = salesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0;
      const totalPurchases = purchasesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0;
      const totalReceivables = ledgersData?.filter(l => l.current_balance > 0).reduce((sum, l) => sum + l.current_balance, 0) || 0;
      const totalPayables = ledgersData?.filter(l => l.current_balance < 0).reduce((sum, l) => sum + Math.abs(l.current_balance), 0) || 0;

      return {
        totalSales,
        totalPurchases,
        totalReceivables,
        totalPayables,
        cashInHand: 125000,
        bankBalance: 1060000,
        todayTransactions: 5,
        pendingInvoices: 8,
      };
    },
    enabled: !!supabase.auth.getUser(),
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
    enabled: !!supabase.auth.getUser(),
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
    enabled: !!supabase.auth.getUser(),
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (company: Company) => {
      const { data, error } = await supabase
        .from('companies')
        .update({
          name: company.name,
          address: company.address,
          gstin: company.gstin,
          pan: company.pan,
          phone: company.phone,
          email: company.email,
          financial_year_start: company.financialYearStart,
          financial_year_end: company.financialYearEnd,
        })
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
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
    isAuthenticated,
    isLoading,
    signOut,
  };
};