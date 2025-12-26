# TallyPrime Clone - Complete Full-Stack Application

## Project Overview

A complete, production-ready TallyPrime clone built with modern technologies. This application includes a full backend with authentication, database, and real-time features.

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system and shadcn/ui components
- **Routing**: React Router v6 for client-side navigation
- **State Management**: React Query (TanStack Query) for server state
- **Forms**: React Hook Form with Zod for validation
- **Icons**: Lucide React for consistent iconography

### Backend
- **Platform**: Nhost (PostgreSQL + Hasura + Authentication)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: JWT-based auth with email/password
- **API**: GraphQL and REST endpoints
- **Real-time**: GraphQL subscriptions for live updates

## Features

### Core Accounting
- **Ledger Management**: Create, edit, delete ledgers with groups
- **Voucher Entry**: All voucher types (Sales, Purchase, Receipt, Payment, Journal, Contra)
- **Double Entry**: Automatic debit/credit validation
- **Balance Tracking**: Real-time ledger balance updates

### Inventory Management
- **Stock Items**: Track inventory with groups and valuations
- **Stock Reports**: Current position and valuation reports
- **Low Stock Alerts**: Automatic notifications for low inventory

### Financial Reports
- **Balance Sheet**: Financial position reporting
- **Profit & Loss**: Income and expense analysis
- **Trial Balance**: Ledger balance verification
- **Day Book**: Transaction history
- **GST Reports**: GSTR-1 and GSTR-3B compliance

### User Management
- **Authentication**: Secure login/signup with email/password
- **User Profiles**: Personal information and settings
- **Company Info**: Business details and financial year setup

## Installation

### Prerequisites
- Node.js (v18 or higher)
- Nhost account (for backend)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tallyprime-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Nhost project details
   ```

4. **Set up Nhost backend**
   - Create a new project on [Nhost](https://nhost.io)
   - Copy the database schema from `src/integrations/nhost/schema.sql`
   - Configure environment variables in Nhost dashboard

5. **Start development server**
   ```bash
   npm run dev
   ```

## Backend Setup

### Database Schema
The application uses a comprehensive PostgreSQL schema with:
- Ledgers with groups and balance tracking
- Vouchers with double-entry accounting
- Stock items with inventory management
- User authentication and authorization
- Row Level Security for data isolation

### API Endpoints
- `GET /api/v1/ledgers` - List ledgers with pagination
- `POST /api/v1/ledgers` - Create new ledger
- `GET /api/v1/vouchers` - List vouchers with pagination
- `POST /api/v1/vouchers` - Create new voucher
- `GET /api/v1/dashboard/metrics` - Dashboard statistics
- `GET /api/v1/stock-items` - Inventory management

### Authentication
- JWT-based authentication
- Email/password login/signup
- Password reset functionality
- User session management

## Development

### Code Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── integrations/       # Backend integrations
│   └── nhost/         # Nhost-specific code
├── types/             # TypeScript type definitions
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── data/              # Mock data (development)
```

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

## Deployment

### Frontend
The application can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Backend
The backend runs on Nhost and includes:
- PostgreSQL database
- Hasura GraphQL engine
- Authentication service
- File storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Email support@tallyprime.com

## Features Roadmap

- [ ] GST Invoice Generation
- [ ] Bank Reconciliation
- [ ] Multi-currency Support
- [ ] Mobile App
- [ ] Advanced Reporting
- [ ] Integration APIs
- [ ] Audit Trail
- [ ] Backup & Restore

## Security

This application implements:
- Row Level Security (RLS) for data isolation
- JWT authentication with secure tokens
- Input validation and sanitization
- HTTPS enforcement
- CORS protection

## Performance

Optimized for performance with:
- React Query caching
- Virtualization for long lists
- Lazy loading for routes
- Image optimization
- Bundle splitting