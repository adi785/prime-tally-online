# AI Development Rules for TallyPrime Clone

## Tech Stack Overview

- **Framework**: React 18 with TypeScript for type-safe UI development
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system and shadcn/ui components
- **Routing**: React Router v6 for client-side navigation
- **State Management**: React Query (TanStack Query) for server state, React hooks for local state
- **UI Components**: shadcn/ui as primary component library with Radix UI primitives
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod for validation
- **Data Visualization**: Recharts for financial charts and reports
- **Notifications**: Sonner and Radix UI Toast for user feedback

## Library Usage Rules

### UI & Styling
- **Primary UI Library**: Use shadcn/ui components whenever possible
- **Custom Components**: Create in `src/components/` with Tailwind CSS styling
- **Icons**: Use Lucide React icons exclusively
- **Styling**: Use Tailwind CSS classes directly in components, avoid CSS-in-JS
- **Responsive Design**: All components must be mobile-responsive using Tailwind's responsive prefixes

### State Management
- **Server State**: Use React Query for all API data fetching and caching
- **Local State**: Use React's useState and useReducer for component state
- **Global State**: Only use Context API for truly global state (user, theme), avoid complex global state solutions
- **Form State**: Use React Hook Form for all forms with Zod for validation schema

### Data Handling
- **Data Types**: Define all data structures in `src/types/` with TypeScript interfaces
- **Mock Data**: Store in `src/data/mockData.ts` until real API integration
- **API Calls**: Create service functions in `src/services/` when connecting to backend
- **Data Validation**: Use Zod for all data validation and parsing

### Routing & Navigation
- **Routing Library**: Use React Router v6 exclusively
- **Route Organization**: Define all routes in `src/App.tsx`
- **Page Components**: Create in `src/pages/` directory
- **Navigation**: Use Link and useNavigate from React Router

### Forms & Validation
- **Form Library**: React Hook Form for all form handling
- **Validation**: Zod for all validation schemas
- **Form Components**: Use shadcn/ui form components with proper labels and error handling
- **Custom Inputs**: Build custom inputs as needed but integrate with React Hook Form

### Notifications & Feedback
- **Toast Notifications**: Use Sonner for application toasts
- **Form Validation**: Show errors inline with form fields
- **Loading States**: Use skeleton loaders or spinner components for async operations
- **User Feedback**: Provide immediate feedback for all user actions

### Data Visualization
- **Charts**: Use Recharts for all data visualization needs
- **Financial Reports**: Create custom components for Tally-style reports
- **Tables**: Use shadcn/ui table components for data grids
- **Printing**: Implement print-friendly layouts using CSS print media queries

### Code Organization
- **Component Structure**: One component per file in appropriate directories
- **File Naming**: Use PascalCase for components, camelCase for utilities
- **Imports**: Use absolute imports with `@/` alias for src directory
- **Hooks**: Custom hooks in `src/hooks/` directory
- **Utilities**: Helper functions in `src/lib/utils.ts` or appropriate subdirectories

### Performance & Best Practices
- **Bundle Size**: Avoid importing entire libraries, use specific imports
- **Accessibility**: All components must follow accessibility best practices
- **Testing**: Write unit tests for utility functions and complex components
- **Code Splitting**: Use React.lazy and Suspense for route-based code splitting
- **Error Boundaries**: Implement error boundaries for graceful error handling

### Tally-Specific Guidelines
- **Financial Calculations**: Use precise decimal calculations for all monetary values
- **Date Handling**: Use date-fns for all date operations, follow Indian financial year conventions
- **Number Formatting**: Use Indian numbering system (lakhs, crores) for all financial displays
- **Keyboard Shortcuts**: Implement F-key shortcuts as shown in Tally interface
- **Print Layouts**: Design all financial documents (invoices, reports) with print compatibility