// Re-export everything from the integration
export * from './client';
export * from './hooks';
export * from './auth';
export * from './services';
export * from './customTypes';
export * from './realtime';

import { supabase } from './client';
import {
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
  useUpdateStockItem,
  useDeleteStockItem,
  useCompany,
  useUpdateCompany,
  useAuthState,
  useVoucherTypes,
  useLedgerGroups,
  useUserSettings,
  useUpdateUserSettings,
} from './hooks';
import {
  ledgerService,
  voucherService,
  dashboardService,
  stockService,
  companyService,
  utilityService,
  reportService,
  settingsService,
} from './services';
import { authService } from './auth';
import { realTimeService } from './realtime';

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
    useUpdateStockItem,
    useDeleteStockItem,
    useCompany,
    useUpdateCompany,
    useAuthState,
    useVoucherTypes,
    useLedgerGroups,
    useUserSettings,
    useUpdateUserSettings,
  },
  services: {
    ledgerService,
    voucherService,
    dashboardService,
    stockService,
    companyService,
    utilityService,
    reportService,
    settingsService,
  },
  auth: authService,
  realtime: realTimeService,
};