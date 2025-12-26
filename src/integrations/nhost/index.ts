// Re-export everything from the integration
export * from './client';
export * from './hooks';
export * from './auth';
export * from './services';
export * from './realtime';
export * from './types';
export * from './schema.sql';
export * from './middleware';

// Export the main integration object
export const nhostIntegration = {
  client: nhost,
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
  services: apiService,
  realtime: realTimeService,
  auth: authService,
};