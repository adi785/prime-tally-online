# Supabase Integration

This directory contains the complete backend integration for the TallyPrime clone using Supabase.

## Features

- **Authentication**: Complete auth system with email/password, sign up, sign in, password reset
- **Database**: PostgreSQL with Row Level Security (RLS) for data isolation
- **API Services**: RESTful API services for all CRUD operations
- **Real-time**: PostgreSQL notifications for real-time data updates
- **File Storage**: Supabase storage for document uploads
- **Security**: Built-in security with RLS policies and JWT authentication

## Database Schema

The schema includes tables for:

- **Ledgers**: Account ledgers with groups and balances
- **Vouchers**: All voucher types with double-entry accounting
- **Stock Items**: Inventory management
- **Companies**: Company information
- **Voucher Types**: Enum for voucher types
- **Ledger Groups**: Enum for ledger groups

## API Endpoints

### Ledgers
- `GET /rest/v1/ledgers` - List ledgers with pagination
- `POST /rest/v1/ledgers` - Create new ledger
- `PUT /rest/v1/ledgers/:id` - Update ledger
- `DELETE /rest/v1/ledgers/:id` - Delete ledger

### Vouchers
- `GET /rest/v1/vouchers` - List vouchers with pagination
- `POST /rest/v1/vouchers` - Create new voucher
- `PUT /rest/v1/vouchers/:id` - Update voucher
- `DELETE /rest/v1/vouchers/:id` - Delete voucher

### Dashboard
- `POST /rest/v1/rpc/get_dashboard_metrics` - Get dashboard statistics

### Stock
- `GET /rest/v1/stock_items` - Get all stock items
- `POST /rest/v1/stock_items` - Create new stock item
- `PUT /rest/v1/stock_items/:id` - Update stock item
- `DELETE /rest/v1/stock_items/:id` - Delete stock item

### Company
- `GET /rest/v1/companies` - Get company information
- `PUT /rest/v1/companies/:id` - Update company information

## Usage

```typescript
import { supabaseIntegration } from '@/integrations/supabase';

// Use hooks in components
const { data: ledgers, isLoading } = supabaseIntegration.hooks.useLedgers();

// Use services directly
const newLedger = await supabaseIntegration.services.createLedger({
  name: 'New Ledger',
  group_id: 'sundry-debtors',
  opening_balance: 1000,
});

// Use auth
await supabaseIntegration.auth.signIn('user@example.com', 'password');

// Use real-time subscriptions
const subscription = supabaseIntegration.realtime.subscribeToLedgers(
  (ledger) => console.log('New ledger created:', ledger),
  (ledger) => console.log('Ledger updated:', ledger)
);
```

## Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
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

The integration supports real-time updates via PostgreSQL notifications:

```typescript
// Subscribe to ledger changes
const subscription = realTimeService.subscribeToLedgers(
  (newLedger) => console.log('Ledger created:', newLedger),
  (updatedLedger) => console.log('Ledger updated:', updatedLedger),
  (deletedLedger) => console.log('Ledger deleted:', deletedLedger)
);

// Remember to unsubscribe when component unmounts
return () => subscription.unsubscribe();