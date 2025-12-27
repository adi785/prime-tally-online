import { ledgerService } from './services/ledgerService';
import { voucherService } from './services/voucherService';
import { dashboardService } from './services/dashboardService';
import { stockService } from './services/stockService';
import { companyService } from './services/companyService';
import { utilityService } from './services/utilityService';
import { reportService } from './services/reportService';
import { settingsService } from './services/settingsService'; // Import settingsService

// Re-export all services for backward compatibility
export {
  ledgerService,
  voucherService,
  dashboardService,
  stockService,
  companyService,
  utilityService,
  reportService,
  settingsService, // Export settingsService
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
  settings: settingsService, // Add settingsService to the main integration object
};