import { useState } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  BarChart3, 
  Package, 
  Settings, 
  Users, 
  Calculator, 
  ChevronDown, 
  ChevronRight, 
  Receipt, 
  CreditCard, 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  FileSpreadsheet, 
  PieChart, 
  TrendingUp, 
  Building2, 
  HelpCircle 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router-dom'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  children?: MenuItem[]
}

interface TallySidebarProps {
  activeSection: string
}

const menuItems: MenuItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: <LayoutDashboard size={18} />, 
    shortcut: 'F1' 
  },
  { 
    id: 'vouchers', 
    label: 'Vouchers', 
    icon: <FileText size={18} />, 
    shortcut: 'V',
    children: [
      { id: 'sales', label: 'Sales', icon: <ArrowUpFromLine size={16} />, shortcut: 'F8' },
      { id: 'purchase', label: 'Purchase', icon: <ArrowDownToLine size={16} />, shortcut: 'F9' },
      { id: 'payment', label: 'Payment', icon: <CreditCard size={16} />, shortcut: 'F5' },
      { id: 'receipt', label: 'Receipt', icon: <Wallet size={16} />, shortcut: 'F6' },
      { id: 'journal', label: 'Journal', icon: <Receipt size={16} />, shortcut: 'F7' },
      { id: 'contra', label: 'Contra', icon: <Calculator size={16} />, shortcut: 'F4' },
    ]
  },
  { 
    id: 'masters', 
    label: 'Masters', 
    icon: <BookOpen size={18} />, 
    shortcut: 'M',
    children: [
      { id: 'ledgers', label: 'Ledgers', icon: <BookOpen size={16} /> },
      { id: 'groups', label: 'Groups', icon: <Users size={16} /> },
      { id: 'stock-items', label: 'Stock Items', icon: <Package size={16} /> },
    ]
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: <BarChart3 size={18} />, 
    shortcut: 'R',
    children: [
      { id: 'balance-sheet', label: 'Balance Sheet', icon: <FileSpreadsheet size={16} /> },
      { id: 'profit-loss', label: 'Profit & Loss', icon: <TrendingUp size={16} /> },
      { id: 'trial-balance', label: 'Trial Balance', icon: <PieChart size={16} /> },
      { id: 'day-book', label: 'Day Book', icon: <FileText size={16} /> },
    ]
  },
  { 
    id: 'inventory', 
    label: 'Inventory', 
    icon: <Package size={18} />, 
    shortcut: 'I' 
  },
]

const bottomMenuItems: MenuItem[] = [
  { id: 'company', label: 'Company Info', icon: <Building2 size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  { id: 'help', label: 'Help', icon: <HelpCircle size={18} />, shortcut: 'F1' },
]

export function TallySidebar({ activeSection }: TallySidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['vouchers'])
  const navigate = useNavigate()
  const location = useLocation()

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    )
  }

  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault()
    navigate(path)
  }

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const isActive = activeSection === item.id

    return (
      <div key={item.id}>
        <a
          href={`/${item.id}`}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault()
              toggleExpand(item.id)
            } else {
              handleNavigation(`/${item.id}`, e)
            }
          }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200",
            isChild ? "pl-10" : "pl-4",
            isActive ? "bg-sidebar-accent text-sidebar-foreground border-l-2 border-sidebar-primary" : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-2 border-transparent",
          )}
        >
          <span className={cn(
            "transition-colors",
            isActive ? "text-sidebar-primary" : ""
          )}>
            {item.icon}
          </span>
          <span className="flex-1 text-left font-medium">{item.label}</span>
          {item.shortcut && !hasChildren && (
            <span className="kbd-badge">{item.shortcut}</span>
          )}
          {hasChildren && (
            <span className="text-sidebar-muted">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
        </a>
        {hasChildren && isExpanded && (
          <div className="animate-fade-in">
            {item.children?.map(child => renderMenuItem(child, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tally-blue to-tally-purple flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-bold text-lg tracking-tight">TallyPrime</h1>
            <p className="text-sidebar-muted text-xs">Business Management</p>
          </div>
        </div>
      </div>
      
      {/* Main Menu */}
      <nav className="flex-1 py-4 overflow-y-auto tally-scrollbar">
        <div className="space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>
      
      {/* Bottom Menu */}
      <div className="border-t border-sidebar-border py-2">
        {bottomMenuItems.map(item => renderMenuItem(item))}
      </div>
      
      {/* Version Info */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-sidebar-muted text-xs text-center">
          Version 4.0 • Release 1.1
        </p>
      </div>
    </aside>
  )
}