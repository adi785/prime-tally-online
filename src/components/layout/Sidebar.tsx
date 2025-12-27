import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  BarChart3, 
  Package, 
  Settings,
  Users,
  CreditCard,
  Wallet,
  Receipt,
  Calculator
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { 
    name: 'Vouchers', 
    href: '#', 
    icon: FileText,
    children: [
      { name: 'Sales', href: '/vouchers/sales' },
      { name: 'Purchase', href: '/vouchers/purchase' },
      { name: 'Payment', href: '/vouchers/payment' },
      { name: 'Receipt', href: '/vouchers/receipt' },
      { name: 'Journal', href: '/vouchers/journal' },
      { name: 'Contra', href: '/vouchers/contra' },
    ]
  },
  { 
    name: 'Masters', 
    href: '#', 
    icon: BookOpen,
    children: [
      { name: 'Ledgers', href: '/ledgers' },
      { name: 'Groups', href: '/groups' },
      { name: 'Stock Items', href: '/stock-items' },
    ]
  },
  { 
    name: 'Reports', 
    href: '#', 
    icon: BarChart3,
    children: [
      { name: 'Balance Sheet', href: '/reports/balance-sheet' },
      { name: 'Profit & Loss', href: '/reports/profit-loss' },
      { name: 'Trial Balance', href: '/reports/trial-balance' },
      { name: 'Day Book', href: '/reports/day-book' },
    ]
  },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Company Info', href: '/company', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="flex h-16 items-center px-4 border-b">
        <h2 className="text-lg font-bold">TallyPrime</h2>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  'flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  location.pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
              {item.children && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      to={child.href}
                      className={cn(
                        'block px-2 py-1 text-sm rounded-md',
                        location.pathname === child.href
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}