# Nhost Integration

This directory contains the complete backend integration for the TallyPrime clone using Nhost.

## Features

- **Authentication**: Complete auth system with email/password, sign up, sign in, password reset
- **Database**: PostgreSQL with Row Level Security (RLS) for data isolation
- **API Services**: RESTful API services for all CRUD operations
- **Real-time**: GraphQL subscriptions for real-time data updates
- **File Storage**: Nhost storage for document uploads
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
- `GET /api/v1/ledgers` - Get all ledgers with pagination
- `POST /api/v1/ledgers` - Create new ledger
- `PUT /api/v1/ledgers/:id` - Update ledger
- `DELETE /api/v1/ledgers/:id` - Delete ledger

### Vouchers
- `GET /api/v1/vouchers` - Get all vouchers with pagination
- `POST /api/v1/vouchers` - Create new voucher
- `PUT /api/v1/vouchers/:id` - Update voucher
- `DELETE /api/v1/vouchers/:id` - Delete voucher

### Dashboard
- `GET /api/v1/dashboard/metrics` - Get dashboard metrics

### Stock
- `GET /api/v1/stock-items` - Get all stock items
- `POST /api/v1/stock-items` - Create new stock item
- `PUT /api/v1/stock-items/:id` - Update stock item
- `DELETE /api/v1/stock-items/:id` - Delete stock item

### Company
- `GET /api/v1/company` - Get company information
- `PUT /api/v1/company` - Update company information

## Usage

```typescript
import { nhostIntegration } from '@/integrations/nhost';

// Use hooks in components
const { data: ledgers, isLoading } = nhostIntegration.hooks.useLedgers();

// Use services directly
const newLedger = await nhostIntegration.services.createLedger({
  name: 'New Ledger',
  group_id: 'sundry-debtors',
  opening_balance: 1000,
});

// Use auth
await nhostIntegration.auth.signIn('user@example.com', 'password');

// Use real-time subscriptions
const subscription = nhostIntegration.realtime.subscribeToLedgers(
  (ledger) => console.log('New ledger created:', ledger),
  (ledger) => console.log('Ledger updated:', ledger)
);
```

## Environment Variables

Add these to your `.env` file:

```env
VITE_NHOST_SUBDOMAIN=your-project-subdomain
VITE_NHOST_REGION=us-east-1
VITE_NHOST_BACKEND_URL=https://your-project-subdomain.your-region.nhost.run
```

## Security

- All data is protected by Row Level Security (RLS)
- Users can only access their own data
- JWT tokens are used for authentication
- All API calls require authentication

## Migration

To set up the database schema:

1. Copy the SQL from `schema.sql`
2. Run it in your Nhost database console
3. The schema includes triggers for automatic balance updates and voucher numbering

## Real-time Updates

The integration supports real-time updates via GraphQL subscriptions:

```typescript
// Subscribe to ledger changes
const subscription = realTimeService.subscribeToLedgers(
  (newLedger) => console.log('Ledger created:', newLedger),
  (updatedLedger) => console.log('Ledger updated:', updatedLedger),
  (deletedLedger) => console.log('Ledger deleted:', deletedLedger)
);

// Remember to unsubscribe when component unmounts
return () => subscription.unsubscribe();