// Re-export everything from the integration
export * from './client';
export * from './hooks';
export * from './auth';
export * from './services';
export * from './realtime';
export * from './types';
export * from './schema.sql';

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
    useDashboardMetrics,
    useStockItems,
    useCreateStockItem,
    useCompany,
    useUpdateCompany,
    useAuthState,
  },
  services: {
    ledgerService,
    voucherService,
    dashboardService,
    stockService,
    companyService,
    authService,
  },
  realtime: realTimeService,
  auth: authService,
};