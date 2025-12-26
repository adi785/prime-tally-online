import { X, Keyboard, BookOpen, Video, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const shortcuts = [
    { key: 'F1', description: 'Help' },
    { key: 'F2', description: 'Change Date' },
    { key: 'F3', description: 'Change Company' },
    { key: 'F4', description: 'Contra Voucher' },
    { key: 'F5', description: 'Payment Voucher' },
    { key: 'F6', description: 'Receipt Voucher' },
    { key: 'F7', description: 'Journal Voucher' },
    { key: 'F8', description: 'Sales Voucher' },
    { key: 'F9', description: 'Purchase Voucher' },
    { key: 'Ctrl+G', description: 'Search' },
    { key: 'Alt+R', description: 'Reports' },
    { key: 'Alt+G', description: 'Go to Ledger' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-muted/50">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpen size={20} /> Help & Support
          </h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto tally-scrollbar p-6">
          <div className="space-y-6">
            {/* Keyboard Shortcuts */}
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Keyboard size={18} /> Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shortcuts.map((shortcut, index) => (
                  <div 
                    key={shortcut.key}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg animate-fade-in"
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <span className="text-foreground">{shortcut.description}</span>
                    <kbd className="kbd-badge">{shortcut.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Support Options */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Support Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Video className="text-primary mb-2" size={24} />
                  <h4 className="font-medium text-foreground mb-1">Video Tutorials</h4>
                  <p className="text-sm text-muted-foreground">Step-by-step guides</p>
                </div>
                <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <BookOpen className="text-primary mb-2" size={24} />
                  <h4 className="font-medium text-foreground mb-1">User Manual</h4>
                  <p className="text-sm text-muted-foreground">Complete documentation</p>
                </div>
                <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Mail className="text-primary mb-2" size={24} />
                  <h4 className="font-medium text-foreground mb-1">Contact Support</h4>
                  <p className="text-sm text-muted-foreground">Get help from experts</p>
                </div>
              </div>
            </div>
            
            {/* About */}
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-2">About TallyPrime Clone</h3>
              <p className="text-sm text-muted-foreground">
                This is a demonstration application built with React, TypeScript, and Tailwind CSS. 
                It simulates the core functionality of TallyPrime for educational purposes.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}