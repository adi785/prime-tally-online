# Supabase Integration

This directory contains the complete backend integration for the TallyPrime clone using Supabase.

## Features

- **Authentication**: Complete auth system with email/password, sign up, sign in, password reset
- **Database**: PostgreSQL with Row Level Security (RLS) for data isolation
- **API Services**: Modular service architecture with dedicated services for each domain
- **Real-time**: Supabase Realtime for live updates
- **File Storage**: Supabase Storage for document uploads
- **Security**: Built-in security with RLS policies and JWT authentication

## Modular Service Architecture

The services are organized into dedicated modules for better maintainability:

### Core Services
- **Ledger Service** (`ledgerService`): Manage account ledgers and groups
- **Voucher Service** (`voucherService`): Handle all voucher types and items
- **Dashboard Service** (`dashboardService`): Calculate and provide dashboard metrics
- **Stock Service** (`stockService`): Inventory management and stock items
- **Company Service** (`companyService`): Company information management

### Utility Services
- **Utility Service** (`utilityService`): Common utilities and search functions
- **Report Service** (`reportService`): Financial report generation

## Database Schema

The schema includes tables for:

- **Ledgers**: Account ledgers with groups and balances
- **Vouchers**: All voucher types with double-entry accounting
- **Voucher Items**: Individual ledger entries for each voucher
- **Stock Items**: Inventory management
- **Companies**: Company information
- **Enums**: Voucher types and ledger groups

## API Endpoints

### Ledgers
- `GET /rest/v1/ledgers` - Get all ledgers with filtering
- `POST /rest/v1/ledgers` - Create new ledger
- `PATCH /rest/v1/ledgers` - Update ledger
- `DELETE /rest/v1/ledgers` - Delete ledger

### Vouchers
- `GET /rest/v1/vouchers` - Get all vouchers with items
- `POST /rest/v1/vouchers` - Create new voucher
- `PATCH /rest/v1/vouchers` - Update voucher
- `DELETE /rest/v1/vouchers` - Delete voucher

### Dashboard
- Custom function to calculate dashboard metrics

### Stock
- `GET /rest/v1/stock_items` - Get all stock items
- `POST /rest/v1/stock_items` - Create new stock item
- `PATCH /rest/v1/stock_items` - Update stock item
- `DELETE /rest/v1/stock_items` - Delete stock item

### Company
- `GET /rest/v1/companies` - Get company information
- `PATCH /rest/v1/companies` - Update company information

## Usage

```typescript
import { ledgerService, voucherService, dashboardService } from '@/integrations/supabase/services';

// Use ledger service
const ledgers = await ledgerService.getLedgers({ search: 'cash' });
const newLedger = await ledgerService.createLedger({
  name: 'New Ledger',
  group: 'cash-in-hand',
  opening_balance: 1000,
});

// Use voucher service
const vouchers = await voucherService.getVouchers({ type: 'sales' });
const newVoucher = await voucherService.createVoucher({
  type_id: 'sales',
  date: '2024-12-26',
  party_ledger_id: '123',
  items: [{ ledger_id: '456', amount: 1000, type: 'debit' }],
});

// Use dashboard service
const metrics = await dashboardService.getDashboardMetrics();
```

## Service Methods

### Ledger Service
- `getLedgers(params?: LedgerQueryParams): Promise<Ledger[]>`
- `getLedger(id: string): Promise<Ledger>`
- `createLedger(data: CreateLedgerRequest): Promise<Ledger>`
- `updateLedger(id: string, data: UpdateLedgerRequest): Promise<Ledger>`
- `deleteLedger(id: string): Promise<void>`
- `searchLedgers(query: string): Promise<Ledger[]>`
- `getLedgerGroups(): Promise<Array<{ id: string; name: string }>>`

### Voucher Service
- `getVouchers(params?: VoucherQueryParams): Promise<Voucher[]>`
- `getVoucher(id: string): Promise<Voucher>`
- `createVoucher(data: CreateVoucherRequest): Promise<Voucher>`
- `updateVoucher(id: string, data: UpdateVoucherRequest): Promise<Voucher>`
- `deleteVoucher(id: string): Promise<void>`
- `getVoucherTypes(): Promise<Array<{ id: string; name: string }>>`

### Dashboard Service
- `getDashboardMetrics(): Promise<DashboardMetricsResponse>`

### Stock Service
- `getStockItems(params?: StockQueryParams): Promise<StockItem[]>`
- `getStockItem(id: string): Promise<StockItem>`
- `createStockItem(data: CreateStockItemRequest): Promise<StockItem>`
- `updateStockItem(id: string, data: UpdateStockItemRequest): Promise<StockItem>`
- `deleteStockItem(id: string): Promise<void>`

### Company Service
- `getCompany(): Promise<Company>`
- `updateCompany(data: UpdateCompanyRequest): Promise<Company>`

### Utility Service
- `searchLedgers(query: string): Promise<Ledger[]>`
- `getVoucherTypes(): Promise<Array<{ id: string; name: string }>>`
- `getLedgerGroups(): Promise<Array<{ id: string; name: string }>>`

### Report Service
- `getBalanceSheet(): Promise<any>`
- `getProfitAndLoss(): Promise<any>`
- `getTrialBalance(): Promise<any>`
- `getDayBook(params: { startDate: string; endDate: string }): Promise<any>`

## Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=https://vrmbazbiwkzxntqbooyu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybWJhemJpd2t6eG50cWJvb3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTE5MTYsImV4cCI6MjA4MjMyNzkxNn0.ZiyzAMlj1UlxNrdwZsZecOwL3RqRC5wD2KEw5-0gKzc
```

## Security

- All data is protected by Row Level Security (RLS)
- Users can only access their own data
- JWT tokens are used for authentication
- All API calls require authentication

## Migration

To set up the database schema:

1. Copy the SQL from `schema.sql`
2. Run it in your Supabase SQL editor
3. The schema includes triggers for automatic balance updates and voucher numbering

## Real-time Updates

The integration supports real-time updates via Supabase Realtime:

```typescript
import { realTimeService } from '@/integrations/supabase/realtime';

// Subscribe to ledger changes
const subscription = realTimeService.subscribeToLedgers(
  (ledger) => console.log('Ledger created:', ledger),
  (ledger) => console.log('Ledger updated:', ledger),
  (ledger) => console.log('Ledger deleted:', ledger)
);
```

## Authentication

Supabase Auth provides:
- Email/password authentication
- Password reset functionality
- User metadata storage
- Session management
- JWT token handling

## File Storage

Supabase Storage can be used for:
- Invoice PDFs
- Company documents
- User avatars
- Backup files

## Error Handling

The integration includes comprehensive error handling:
- Database constraint violations
- Network errors
- Authentication failures
- Validation errors

## Performance

Optimized for performance with:
- Proper indexing
- Efficient queries
- Caching with React Query
- Pagination support

## Modular Benefits

- **Separation of Concerns**: Each service handles a specific domain
- **Testability**: Services can be tested independently
- **Maintainability**: Changes to one service don't affect others
- **Reusability**: Services can be reused across different components
- **Scalability**: Easy to add new services or modify existing ones