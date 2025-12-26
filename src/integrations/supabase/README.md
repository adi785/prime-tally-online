# Supabase Integration

This directory contains the complete backend integration for the TallyPrime clone using Supabase.

## Features

- **Database**: PostgreSQL with Row Level Security (RLS) for data isolation
- **Authentication**: JWT-based auth with email/password, sign up, sign in, password reset
- **Real-time**: PostgreSQL LISTEN/NOTIFY for real-time data updates
- **Storage**: File storage for document uploads (future implementation)
- **Security**: Built-in security with RLS policies and JWT authentication

## Database Schema

The schema includes tables for:

- **Ledgers**: Account ledgers with groups and balances
- **Vouchers**: All voucher types with double-entry accounting
- **Voucher Items**: Individual ledger entries for each voucher
- **Stock Items**: Inventory management
- **Company Info**: Company information
- **Ledger Groups**: Enum for ledger groups
- **Voucher Types**: Enum for voucher types

## API Endpoints

### Ledgers
- `GET /rest/v1/ledgers` - Get all ledgers with pagination
- `POST /rest/v1/ledgers` - Create new ledger
- `PUT /rest/v1/ledgers?id=eq.{id}` - Update ledger
- `DELETE /rest/v1/ledgers?id=eq.{id}` - Delete ledger

### Vouchers
- `GET /rest/v1/vouchers` - Get all vouchers with pagination
- `POST /rest/v1/vouchers` - Create new voucher
- `PUT /rest/v1/vouchers?id=eq.{id}` - Update voucher
- `DELETE /rest/v1/vouchers?id=eq.{id}` - Delete voucher

### Dashboard
- Custom function: `get_dashboard_metrics()` - Get dashboard statistics

### Stock
- `GET /rest/v1/stock_items` - Get all stock items
- `POST /rest/v1/stock_items` - Create new stock item
- `PUT /rest/v1/stock_items?id=eq.{id}` - Update stock item
- `DELETE /rest/v1/stock_items?id=eq.{id}` - Delete stock item

### Company
- `GET /rest/v1/company_info` - Get company information
- `PUT /rest/v1/company_info?id=eq.{id}` - Update company information

## Usage

```typescript
import { supabaseIntegration } from '@/integrations/supabase';

// Use hooks in components
const { data: ledgers, isLoading } = supabaseIntegration.hooks.useLedgers();

// Use services directly
const newLedger = await supabaseIntegration.services.ledgerService.createLedger({
  name: 'New Ledger',
  group: 'sundry-debtors',
  openingBalance: 1000,
});

// Use auth
await supabaseIntegration.auth.signIn('user@example.com', 'password');

// Use real-time subscriptions
const subscription = supabaseIntegration.realtime.subscribeToLedgers(
  (ledger) => console.log('New ledger created:', ledger),
  (ledger) => console.log('Ledger updated:', ledger),
  (ledger) => console.log('Ledger deleted:', ledger)
);
```

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

The integration supports real-time updates via PostgreSQL LISTEN/NOTIFY:

```typescript
// Subscribe to ledger changes
const subscription = realTimeService.subscribeToLedgers(
  (newLedger) => console.log('Ledger created:', newLedger),
  (updatedLedger) => console.log('Ledger updated:', updatedLedger),
  (deletedLedger) => console.log('Ledger deleted:', deletedLedger)
);

// Remember to unsubscribe when component unmounts
return () => subscription.unsubscribe();
```

## Authentication

The integration provides complete authentication functionality:

```typescript
// Sign in
await supabaseIntegration.auth.signIn('user@example.com', 'password');

// Sign up
await supabaseIntegration.auth.signUp('user@example.com', 'password', {
  displayName: 'John Doe'
});

// Sign out
await supabaseIntegration.auth.signOut();

// Check authentication status
const isAuthenticated = supabaseIntegration.auth.isAuthenticated();
```

## Error Handling

All functions include proper error handling with toast notifications:

```typescript
try {
  await supabaseIntegration.services.ledgerService.createLedger(ledgerData);
} catch (error) {
  console.error('Error creating ledger:', error);
  // Error is automatically handled with toast notification
}
```

## Database Triggers

The schema includes several triggers for automatic functionality:

1. **Ledger Balance Updates**: Automatically updates ledger balances when voucher items are inserted/updated/deleted
2. **Voucher Number Generation**: Automatically generates voucher numbers based on type and date
3. **Audit Trail**: Tracks changes to important data

## Row Level Security (RLS)

All tables have RLS policies configured:

- **Public tables**: `ledger_groups`, `voucher_types` (read-only for everyone)
- **Authenticated tables**: All other tables (CRUD operations for authenticated users only)

## Performance Optimizations

- Indexes on frequently queried columns
- Efficient queries with proper joins
- Pagination for large datasets
- Caching with React Query

## Future Enhancements

- File storage for document uploads
- Advanced reporting with complex queries
- Multi-tenant support
- Audit logging
- Backup and restore functionality