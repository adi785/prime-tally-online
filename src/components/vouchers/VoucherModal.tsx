import { useState } from 'react';
import { X, Plus, Trash2, Save, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoucherType } from '@/types/tally';
import { cn } from '@/lib/utils';
import { VoucherForm } from './VoucherForm';

interface VoucherModalProps {
  type: VoucherType;
  isOpen: boolean;
  onClose: () => void;
}

export function VoucherModal({ type, isOpen, onClose }: VoucherModalProps) {
  const [showForm, setShowForm] = useState(false);

  const handleSaveVoucher = (voucherData: any) => {
    console.log('Saving voucher:', voucherData);
    // In a real app, this would call an API or update state management
  };

  if (!isOpen) return null;

  return (
    <VoucherForm
      type={type}
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSaveVoucher}
    />
  );
}