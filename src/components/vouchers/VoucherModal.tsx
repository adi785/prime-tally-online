import { useState } from 'react';
import { X, Plus, Trash2, Save, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoucherType } from '@/types/tally';
import { useCreateVoucher } from '@/integrations/supabase/hooks';
import { VoucherForm } from './VoucherForm';
import { toast } from 'sonner';

interface VoucherModalProps {
  type: VoucherType;
  isOpen: boolean;
  onClose: () => void;
}

export function VoucherModal({ type, isOpen, onClose }: VoucherModalProps) {
  const { mutate: createVoucher, isPending: isCreating } = useCreateVoucher();
  const [showForm, setShowForm] = useState(false);

  const handleSaveVoucher = (voucherData: any) => {
    createVoucher(voucherData);
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