# Supabase Integration

This directory contains the complete backend integration for the TallyPrime clone using Supabase.

## Features

- **Authentication**: Complete auth system with email/password, sign up, sign in, password reset
- **Database**: PostgreSQL with Row Level Security (RLS) for data isolation
- **API Services**: RESTful API services for all CRUD operations
- **Real-time**: Supabase Realtime for live updates
- **File Storage**: Supabase Storage for document uploads
- **Security**: Built-in security with RLS policies and JWT authentication

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
import { supabaseIntegration } from '@/integrations/supabase';

// Use hooks in components
const { data: ledgers, isLoading } = supabaseIntegration.hooks.useLedgers();

// Use services directly
const newLedger = await supabaseIntegration.services.createLedger({
  name: 'New Ledger',
  group: 'sundry-debtors',
  opening_balance: 1000,
});

// Use auth
await supabaseIntegration.auth.signIn('user@example.com', 'password');

// Use real-time subscriptions
const subscription = supabaseIntegration.client
  .channel('ledgers')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'ledgers' }, payload => {
    console.log('Ledger changed:', payload);
  })
  .subscribe();
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

The integration supports real-time updates via Supabase Realtime:

```typescript
// Subscribe to ledger changes
const channel = supabase
  .channel('ledgers')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'ledgers' }, payload => {
    console.log('Ledger changed:', payload);
  })
  .subscribe();
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