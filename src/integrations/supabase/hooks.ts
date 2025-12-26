import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './client';
import { toast } from 'sonner';
import { Ledger, Voucher, DashboardMetrics, StockItem, Company } from '@/types/tally';

// Type definitions for database tables
interface DbLedger {
  id: string;
  name: string;
  group_id: string;
  opening_balance: number;
  current_balance: number;
  address?: string;
  phone?: string;
  gstin?: string;
  email?: string;
  is_billwise: boolean;
  is_inventory: boolean;
  created_at: string;
  updated_at: string;
}

interface DbVoucher {
  id: string;
  voucher_number: string;
  type_id: string;
  date: string;
  party_ledger_id: string;
  narration?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: string;
    ledger_id: string;
    amount: number;
    type: 'debit' | 'credit';
  }>;
}

interface DbStockItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  rate: number;
  value: number;
  group_name: string;
  created_at: string;
  updated_at: string;
}

interface DbCompany {
  id: string;
  name: string;
  address: string;
  gstin: string;
  pan: string;
  phone?: string;
  email?: string;
  financial_year_start: string;
  financial_year_end: string;
  created_at: string;
  updated_at: string;
}

// Ledger hooks
export const useLedgers = () => {
  return useQuery({
    queryKey: ['ledgers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ledgers')
        .select(`
          *,
          ledger_groups (name)
        `)
        .order('name');

      if (error) throw error;

      return data.map(ledger => ({
        id: ledger.id,
        name: ledger.name,
        group: ledger.ledger_groups.name as any,
        openingBalance: ledger.opening_balance,
        currentBalance: ledger.current_balance,
        address: ledger.address,
        phone: ledger.phone,
        gstin: ledger.gstin,
        email: ledger.email,
      }));
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
          group_id: ledger.group,
          opening_balance: ledger.openingBalance,
          address: ledger.address,
          phone: ledger.phone,
          gstin: ledger.gstin,
          email: ledger.email,
          is_billwise: ledger.isBillwise || false,
          is_inventory: ledger.isInventory || false,
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
        .update({
          name: data.name,
          group_id: data.group,
          opening_balance: data.openingBalance,
          address: data.address,
          phone: data.phone,
          gstin: data.gstin,
          email: data.email,
          is_billwise: data.isBillwise,
          is_inventory: data.isInventory,
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
          voucher_types (name),
          party_ledger:ledgers!party_ledger_id (name),
          items: voucher_items (
            *,
            ledger: ledgers (name)
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(voucher => ({
        id: voucher.id,
        voucherNumber: voucher.voucher_number,
        type: voucher.voucher_types.name as any,
        date: voucher.date,
        partyName: voucher.party_ledger.name,
        partyLedgerId: voucher.party_ledger_id,
        items: voucher.items.map(item => ({
          id: item.id,
          particulars: item.ledger.name,
          ledgerId: item.ledger_id,
          amount: item.amount,
          type: item.type,
        })),
        narration: voucher.narration,
        totalAmount: voucher.total_amount,
        createdAt: voucher.created_at,
      }));
    },
  });
};

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voucher: Omit<Voucher, 'id' | 'createdAt'>) => {
      // First, get the voucher type ID
      const { data: voucherType, error: typeError } = await supabase
        .from('voucher_types')
        .select('id')
        .eq('name', voucher.type)
        .single();

      if (typeError) throw typeError;

      // Insert the voucher
      const { data: voucherData, error: voucherError } = await supabase
        .from('vouchers')
        .insert([{
          type_id: voucherType.id,
          date: voucher.date,
          party_ledger_id: voucher.partyLedgerId,
          narration: voucher.narration,
          total_amount: voucher.totalAmount,
        }])
        .select()
        .single();

      if (voucherError) throw voucherError;

      // Insert voucher items
      const { data: itemsData, error: itemsError } = await supabase
        .from('voucher_items')
        .insert(voucher.items.map(item => ({
          voucher_id: voucherData.id,
          ledger_id: item.ledgerId,
          amount: item.amount,
          type: item.type,
        })))
        .select();

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

// Dashboard hooks
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Get total sales
      const { data: salesData } = await supabase
        .from('vouchers')
        .select('total_amount')
        .eq('type_id', (await supabase.from('voucher_types').select('id').eq('name', 'sales').single()).data?.id);

      // Get total purchases
      const { data: purchaseData } = await supabase
        .from('vouchers')
        .select('total_amount')
        .eq('type_id', (await supabase.from('voucher_types').select('id').eq('name', 'purchase').single()).data?.id);

      // Get total receivables (sum of debit balances)
      const { data: receivablesData } = await supabase
        .from('ledgers')
        .select('current_balance')
        .gte('current_balance', 0);

      // Get total payables (sum of credit balances)
      const { data: payablesData } = await supabase
        .from('ledgers')
        .select('current_balance')
        .lt('current_balance', 0);

      // Get cash in hand
      const { data: cashData } = await supabase
        .from('ledgers')
        .select('current_balance')
        .eq('group_id', (await supabase.from('ledger_groups').select('id').eq('name', 'cash-in-hand').single()).data?.id);

      // Get bank balance
      const { data: bankData } = await supabase
        .from('ledgers')
        .select('current_balance')
        .eq('group_id', (await supabase.from('ledger_groups').select('id').eq('name', 'bank-accounts').single()).data?.id);

      // Get today's transactions
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData } = await supabase
        .from('vouchers')
        .select('id')
        .eq('date', today);

      // Get pending invoices (vouchers without payment)
      const { data: pendingData } = await supabase
        .from('vouchers')
        .select('id')
        .is('narration', null);

      return {
        totalSales: salesData?.reduce((sum, v) => sum + v.total_amount, 0) || 0,
        totalPurchases: purchaseData?.reduce((sum, v) => sum + v.total_amount, 0) || 0,
        totalReceivables: receivablesData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
        totalPayables: Math.abs(payablesData?.reduce((sum, l) => sum + l.current_balance, 0) || 0),
        cashInHand: cashData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
        bankBalance: bankData?.reduce((sum, l) => sum + l.current_balance, 0) || 0,
        todayTransactions: todayData?.length || 0,
        pendingInvoices: pendingData?.length || 0,
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
        .order('name');

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        rate: item.rate,
        value: item.value,
        group: item.group_name,
      }));
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
    queryFn: async (): Promise<Company> => {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single();

      if (error) throw error;

      return {
        name: data.name,
        address: data.address,
        gstin: data.gstin,
        pan: data.pan,
        phone: data.phone || '',
        email: data.email || '',
        financialYearStart: data.financial_year_start,
        financialYearEnd: data.financial_year_end,
      };
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (company: Company) => {
      const { data, error } = await supabase
        .from('company_info')
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
        .eq('id', (await supabase.from('company_info').select('id').single()).data?.id)
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
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
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
    isAuthenticated: !!user,
    isLoading,
    user,
    signOut,
  };
};