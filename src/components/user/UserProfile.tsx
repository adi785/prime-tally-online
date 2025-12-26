import { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Lock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const [user, setUser] = useState({
    name: 'Admin User',
    email: 'admin@abcenterprises.com',
    phone: '+91 98765 43210',
    address: '123 Business Park, Mumbai, Maharashtra - 400001',
    joinDate: '2024-01-15',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field: string, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In a real app, this would save to a database
    console.log('Saving user profile:', user);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-muted/50">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User size={20} /> User Profile
          </h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto tally-scrollbar">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-tally-blue to-tally-purple flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">
                {user.name.charAt(0)}
              </span>
            </div>
            <Button variant="outline" size="sm">Change Photo</Button>
          </div>
          
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border pb-2">Personal Information</h3>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Full Name
              </label>
              <Input
                value={user.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  value={user.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  value={user.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <textarea
                  value={user.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter address"
                  className="w-full h-20 px-10 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
            </div>
          </div>
          
          {/* Security */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border pb-2">Security</h3>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Join Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  value={new Date(user.joinDate).toLocaleDateString('en-IN')}
                  readOnly
                  className="pl-10 bg-muted"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="password"
                  value={user.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter new password"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="password"
                  value={user.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save size={16} /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}