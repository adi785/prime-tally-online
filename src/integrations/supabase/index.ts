// Re-export everything from the integration
export * from './client';
export * from './hooks';
export * from './auth';
export * from './services';
export * from './types';
export * from './schema.sql';
export * from './realtime';

// Export the main integration object
export const supabaseIntegration = {
  client: supabase,
  hooks: {
    useLedgers,
    useCreateLedger,
    useUpdateLedger,
    useDeleteLedger,
    useVouchers,
    useCreateVoucher,
    useUpdateVoucher,
    useDeleteVoucher,
    useDashboardMetrics,
    useStockItems,
    useCreateStockItem,
    useCompany,
    useUpdateCompany,
    useAuthState,
  },
  services: supabaseService,
  auth: authService,
  realtime: realTimeService,
};