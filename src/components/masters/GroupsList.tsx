import { useState } from 'react';
import { Search, Plus, Filter, Download, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const groups = [
  { id: '1', name: 'Sundry Debtors', type: 'Assets', nature: 'Debit', description: 'Accounts of customers who buy on credit' },
  { id: '2', name: 'Sundry Creditors', type: 'Liabilities', nature: 'Credit', description: 'Accounts of suppliers from whom we buy on credit' },
  { id: '3', name: 'Bank Accounts', type: 'Assets', nature: 'Debit', description: 'All bank accounts' },
  { id: '4', name: 'Cash-in-Hand', type: 'Assets', nature: 'Debit', description: 'Cash available with the company' },
  { id: '5', name: 'Sales Accounts', type: 'Income', nature: 'Credit', description: 'Accounts for sales revenue' },
  { id: '6', name: 'Purchase Accounts', type: 'Expenses', nature: 'Debit', description: 'Accounts for purchase expenses' },
  { id: '7', name: 'Direct Expenses', type: 'Expenses', nature: 'Debit', description: 'Expenses directly related to production' },
  { id: '8', name: 'Indirect Expenses', type: 'Expenses', nature: 'Debit', description: 'Expenses not directly related to production' },
  { id: '9', name: 'Direct Incomes', type: 'Income', nature: 'Credit', description: 'Incomes directly related to business activities' },
  { id: '10', name: 'Indirect Incomes', type: 'Income', nature: 'Credit', description: 'Incomes not directly related to business activities' },
  { id: '11', name: 'Fixed Assets', type: 'Assets', nature: 'Debit', description: 'Long-term tangible assets' },
  { id: '12', name: 'Current Assets', type: 'Assets', nature: 'Debit', description: 'Short-term assets' },
  { id: '13', name: 'Current Liabilities', type: 'Liabilities', nature: 'Credit', description: 'Short-term obligations' },
  { id: '14', name: 'Capital Account', type: 'Liabilities', nature: 'Credit', description: 'Owner\'s equity in the business' },
];

export function GroupsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || group.type === selectedType;
    return matchesSearch && matchesType;
  });

  const types = Array.from(new Set(groups.map(g => g.type)));

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Groups</h1>
          <p className="text-muted-foreground">Manage ledger groups</p>
        </div>
        <Button className="gap-2">
          <Plus size={16} /> Create Group
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4 animate-fade-in">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search groups..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="h-10 px-4 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <Button variant="outline" size="icon">
          <Filter size={16} />
        </Button>
        <Button variant="outline" size="icon">
          <Download size={16} />
        </Button>
      </div>
      
      {/* Groups Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="bg-table-header border-b border-table-border">
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Name</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Type</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Nature</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Description</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-foreground w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border">
            {filteredGroups.map((group, index) => (
              <tr 
                key={group.id} 
                className="hover:bg-table-row-hover transition-colors cursor-pointer animate-slide-in"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{group.name}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">{group.type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${
                    group.nature === 'Debit' 
                      ? 'text-success' 
                      : 'text-destructive'
                  }`}>
                    {group.nature}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-muted-foreground">{group.description}</p>
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
        {filteredGroups.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No groups found matching your criteria.</p>
          </div>
        )}
      </div>
      
      {/* Summary Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground animate-fade-in">
        <span>Showing {filteredGroups.length} of {groups.length} groups</span>
        <div className="flex gap-6">
          <span>Assets: <span className="font-mono font-semibold text-foreground">5</span></span>
          <span>Liabilities: <span className="font-mono font-semibold text-foreground">4</span></span>
          <span>Income: <span className="font-mono font-semibold text-foreground">3</span></span>
          <span>Expenses: <span className="font-mono font-semibold text-foreground">2</span></span>
        </div>
      </div>
    </div>
  );
}