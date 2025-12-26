import { useState } from 'react';
import { ledgers as initialLedgers } from '@/data/mockData';
import { Ledger, LedgerGroup } from '@/types/tally';
import { cn } from '@/lib/utils';
import { Search, Plus, Filter, Download, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreateLedgerModal } from './CreateLedgerModal';

const groupLabels: Record<LedgerGroup, string> = {
  'sundry-debtors': 'Sundry Debtors',
  'sundry-creditors': 'Sundry Creditors',
  'bank-accounts': 'Bank Accounts',
  'cash-in-hand': 'Cash-in-Hand',
  'sales-accounts': 'Sales Accounts',
  'purchase-accounts': 'Purchase Accounts',
  'direct-expenses': 'Direct Expenses',
  'indirect-expenses': 'Indirect Expenses',
  'direct-incomes': 'Direct Incomes',
  'indirect-incomes': 'Indirect Incomes',
  'fixed-assets': 'Fixed Assets',
  'current-assets': 'Current Assets',
  'current-liabilities': 'Current Liabilities',
  'capital-account': 'Capital Account',
};

export function LedgerList() {
  const [ledgers, setLedgers] = useState<Ledger[]>(initialLedgers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<LedgerGroup | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleAddLedger = (newLedger: {
    name: string;
    group: LedgerGroup;
    openingBalance: number;
  }) => {
    const ledger: Ledger = {
      id: `ledger-${Date.now()}`,
      name: newLedger.name,
      group: newLedger.group,
      openingBalance: newLedger.openingBalance,
      currentBalance: newLedger.openingBalance,
    };
    
    setLedgers([...ledgers, ledger]);
  };

  const filteredLedgers = ledgers.filter(ledger => {
    const matchesSearch = ledger.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || ledger.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absAmount);
    return amount < 0 ? `${formatted} Cr` : `${formatted} Dr`;
  };

  const groups = Array.from(new Set(ledgers.map(l => l.group)));

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ledgers</h1>
          <p className="text-muted-foreground">Manage your account ledgers</p>
        </div>
        <Button 
          className="gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={16} /> Create Ledger
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4 animate-fade-in">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search ledgers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value as LedgerGroup | 'all')}
          className="h-10 px-4 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Groups</option>
          {groups.map(group => (
            <option key={group} value={group}>{groupLabels[group]}</option>
          ))}
        </select>
        <Button variant="outline" size="icon">
          <Filter size={16} />
        </Button>
        <Button variant="outline" size="icon">
          <Download size={16} />
        </Button>
      </div>
      
      {/* Ledger Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="bg-table-header border-b border-table-border">
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Name</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Group</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Opening Balance</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Current Balance</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-foreground w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border">
            {filteredLedgers.map((ledger, index) => (
              <tr 
                key={ledger.id} 
                className="hover:bg-table-row-hover transition-colors cursor-pointer animate-slide-in"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{ledger.name}</p>
                    {ledger.gstin && (
                      <p className="text-xs text-muted-foreground">GSTIN: {ledger.gstin}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">{groupLabels[ledger.group]}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={cn(
                    "font-mono text-sm",
                    ledger.openingBalance < 0 ? "amount-positive" : 
                    ledger.openingBalance > 0 ? "amount-neutral" : 
                    "text-muted-foreground"
                  )}>
                    {ledger.openingBalance === 0 ? '-' : formatAmount(ledger.openingBalance)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={cn(
                    "font-mono text-sm font-semibold",
                    ledger.currentBalance < 0 ? "amount-positive" : 
                    ledger.currentBalance > 0 ? "amount-negative" : 
                    "text-muted-foreground"
                  )}>
                    {ledger.currentBalance === 0 ? '-' : formatAmount(ledger.currentBalance)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLedgers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No ledgers found matching your criteria.</p>
          </div>
        )}
      </div>
      
      {/* Summary Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground animate-fade-in">
        <span>Showing {filteredLedgers.length} of {ledgers.length} ledgers</span>
        <div className="flex gap-6">
          <span>Total Debit: <span className="font-mono font-semibold text-foreground">₹28,47,500</span></span>
          <span>Total Credit: <span className="font-mono font-semibold text-foreground">₹24,25,000</span></span>
        </div>
      </div>
      
      {/* Create Ledger Modal */}
      <CreateLedgerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddLedger={handleAddLedger}
      />
    </div>
  );
}