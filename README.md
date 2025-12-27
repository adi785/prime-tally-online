# TallyPrime Clone - Business Management System

A complete business management system inspired by TallyPrime, built with modern web technologies.

## Features

- **Authentication**: Secure login/signup with Supabase Auth
- **Dashboard**: Financial overview with key metrics
- **Ledger Management**: Create and manage account ledgers
- **Voucher System**: Record all types of financial transactions
- **Inventory Management**: Track stock items and quantities
- **Reporting**: Financial reports (balance sheet, profit & loss, etc.)
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: Tailwind CSS, shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router
- **Backend**: Supabase (Database, Auth, Realtime)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/tallyprime-clone.git
cd tallyprime-clone
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Deployment

### Frontend

This application can be deployed to any static hosting service:

- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

To build for production:
```bash
npm run build
```

### Backend

The backend uses Supabase which requires:

1. Supabase project setup
2. Database schema creation
3. Authentication configuration

## Project Structure

```
src/
├── components/        # Reusable UI components
├── integrations/      # Supabase integration
├── lib/               # Utility functions
├── pages/             # Page components
├── App.tsx            # Main application component
└── main.tsx           # Entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team