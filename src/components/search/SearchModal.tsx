import { useState, useEffect } from 'react';
import { X, Search, FileText, BookOpen, Package, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ledgers, vouchers, stockItems } from '@/data/mockData';
import { VoucherType } from '@/types/tally';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'voucher' | 'ledger' | 'stock' | 'group';
  icon: React.ReactNode;
  data: any;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string, data?: any) => void;
}

export function SearchModal({ isOpen, onClose, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Generate search results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchTerm = query.toLowerCase();
    
    // Search vouchers
    const voucherResults: SearchResult[] = vouchers
      .filter(v => 
        v.voucherNumber.toLowerCase().includes(searchTerm) ||
        v.partyName.toLowerCase().includes(searchTerm) ||
        v.type.toLowerCase().includes(searchTerm)
      )
      .map(v => ({
        id: `voucher-${v.id}`,
        title: `${v.voucherNumber} - ${v.partyName}`,
        description: `${v.type.replace('-', ' ')} voucher • ${new Date(v.date).toLocaleDateString()}`,
        type: 'voucher',
        icon: <FileText size={16} />,
        data: v
      }));

    // Search ledgers
    const ledgerResults: SearchResult[] = ledgers
      .filter(l => 
        l.name.toLowerCase().includes(searchTerm) ||
        l.group.toLowerCase().includes(searchTerm)
      )
      .map(l => ({
        id: `ledger-${l.id}`,
        title: l.name,
        description: `${l.group.replace('-', ' ')} • Balance: ₹${Math.abs(l.currentBalance).toLocaleString()}`,
        type: 'ledger',
        icon: <BookOpen size={16} />,
        data: l
      }));

    // Search stock items
    const stockResults: SearchResult[] = stockItems
      .filter(s => 
        s.name.toLowerCase().includes(searchTerm) ||
        s.group.toLowerCase().includes(searchTerm)
      )
      .map(s => ({
        id: `stock-${s.id}`,
        title: s.name,
        description: `${s.group} • Qty: ${s.quantity} ${s.unit}`,
        type: 'stock',
        icon: <Package size={16} />,
        data: s
      }));

    // Combine and limit results
    const allResults = [...voucherResults, ...ledgerResults, ...stockResults].slice(0, 10);
    setResults(allResults);
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        handleResultClick(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'voucher':
        // In a real app, this would open the voucher details
        onNavigate('dashboard');
        break;
      case 'ledger':
        onNavigate('ledgers');
        break;
      case 'stock':
        onNavigate('inventory');
        break;
      default:
        onNavigate('dashboard');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20 animate-fade-in">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Search vouchers, ledgers, stock items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 h-12 text-base"
              autoFocus
            />
            <button 
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Results */}
        <div className="max-h-96 overflow-y-auto tally-scrollbar">
          {results.length > 0 ? (
            <div className="divide-y divide-border">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                    index === selectedIndex && "bg-muted/80"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">
                      {result.icon}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{result.title}</p>
                      <p className="text-sm text-muted-foreground">{result.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No results found for "{query}"</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="mx-auto text-muted-foreground mb-3" size={32} />
              <p className="text-muted-foreground">Start typing to search</p>
              <p className="text-sm text-muted-foreground mt-2">
                Search for vouchers, ledgers, stock items and more
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Use ↑ ↓ to navigate, Enter to select</span>
            <span>{results.length} results</span>
          </div>
        </div>
      </div>
    </div>
  );
}