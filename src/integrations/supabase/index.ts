// Re-export everything from the integration
export * from './client';
export * from './hooks';
export * from './auth';
export * from './services';
export * from './types';
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
    useUpdateStockItem, // Added useUpdateStockItem
    useDeleteStockItem, // Added useDeleteStockItem
    useCompany,
    useUpdateCompany,
    useAuthState,
    useVoucherTypes, // Added useVoucherTypes
    useLedgerGroups, // Added useLedgerGroups
    useUserSettings, // Added useUserSettings
    useUpdateUserSettings, // Added useUpdateUserSettings
  },
  services: {
    ledgerService,
    voucherService,
    dashboardService,
    stockService,
    companyService,
    utilityService,
    reportService,
    settingsService, // Added settingsService
  },
  auth: authService,
  realtime: realTimeService,
};