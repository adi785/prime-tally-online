import { ledgerService } from './services/ledgerService';
import { voucherService } from './services/voucherService';
import { dashboardService } from './services/dashboardService';
import { stockService } from './services/stockService';
import { companyService } from './services/companyService';
import { utilityService } from './services/utilityService';
import { reportService } from './services/reportService';

// Re-export all services for backward compatibility
export {
  ledgerService,
  voucherService,
  dashboardService,
  stockService,
  companyService,
  utilityService,
  reportService,
};

// Export the main integration object
export const supabaseService = {
  ledger: ledgerService,
  voucher: voucherService,
  dashboard: dashboardService,
  stock: stockService,
  company: companyService,
  utility: utilityService,
  report: reportService,
};