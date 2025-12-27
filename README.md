# TallyPrime Modern App

A modern accounting application built with React, TypeScript, and Supabase.

## Features

- User authentication (login/signup)
- Dashboard with financial metrics
- Ledger management
- Voucher management
- Inventory tracking
- Responsive design

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Authentication, Database, Realtime)
- **State Management**: React Query
- **Routing**: React Router
- **Build Tool**: Vite

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

## Deployment

To build for production:
```bash
npm run build
```

The build output will be in the `dist` folder, ready for deployment to any static hosting service.

## Database Schema

The application uses the following tables in Supabase:

- `ledgers`: Account ledgers with balances
- `vouchers`: Financial transactions
- `stock_items`: Inventory items
- `companies`: Company information

## Supabase Functions

The app uses the following Supabase RPC functions:

- `get_dashboard_metrics()`: Retrieves dashboard statistics
- `get_company_info()`: Gets company details

## License

MIT