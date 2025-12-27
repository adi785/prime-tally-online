import { useState, useEffect } from 'react'
import { useCompany, useUpdateCompany, useCreateCompany } from '@/integrations/supabase/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertCircle } from 'lucide-react'

export default function CompanyInfo() {
  const { data: company, isLoading, error } = useCompany()
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany()
  const { mutate: createCompany, isPending: isCreating } = useCreateCompany()

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    gstin: '',
    pan: '',
    phone: '',
    email: '',
    financial_year_start: '',
    financial_year_end: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        address: company.address || '',
        gstin: company.gstin || '',
        pan: company.pan || '',
        phone: company.phone || '',
        email: company.email || '',
        financial_year_start: company.financial_year_start || '',
        financial_year_end: company.financial_year_end || '',
      })
    } else {
      // Reset form if no company data
      setFormData({
        name: '',
        address: '',
        gstin: '',
        pan: '',
        phone: '',
        email: '',
        financial_year_start: '',
        financial_year_end: '',
      });
    }
  }, [company])

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Company name is required.';
    if (!formData.address.trim()) errors.address = 'Address is required.';
    if (!formData.gstin.trim()) errors.gstin = 'GSTIN is required.';
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(formData.gstin)) errors.gstin = 'Invalid GSTIN format.';
    if (!formData.pan.trim()) errors.pan = 'PAN is required.';
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) errors.pan = 'Invalid PAN format.';
    if (!formData.financial_year_start) errors.financial_year_start = 'Financial year start date is required.';
    if (!formData.financial_year_end) errors.financial_year_end = 'Financial year end date is required.';
    if (new Date(formData.financial_year_start) >= new Date(formData.financial_year_end)) {
      errors.financial_year_end = 'End date must be after start date.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    setFormErrors(prev => ({ ...prev, [id]: '' })); // Clear error on change
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Validation Error", { description: "Please correct the errors in the form." });
      return;
    }

    if (company?.id) {
      updateCompany({ id: company.id, ...formData })
    } else {
      createCompany(formData)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error && !company) {
    return (
      <div className="p-6 text-center py-8">
        <div className="text-destructive mb-4">
          <AlertCircle size={32} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Company Info</h3>
        <p className="text-muted-foreground">Failed to load company details. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{company ? 'Company Information' : 'Create Your Company Profile'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className={formErrors.name ? 'border-destructive' : ''}
                  />
                  {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN *</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="Enter GSTIN"
                    className={formErrors.gstin ? 'border-destructive' : ''}
                    maxLength={15}
                  />
                  {formErrors.gstin && <p className="text-sm text-destructive">{formErrors.gstin}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter company address"
                    className={formErrors.address ? 'border-destructive' : ''}
                  />
                  {formErrors.address && <p className="text-sm text-destructive">{formErrors.address}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN *</Label>
                  <Input
                    id="pan"
                    value={formData.pan}
                    onChange={handleChange}
                    placeholder="Enter PAN number"
                    className={formErrors.pan ? 'border-destructive' : ''}
                    maxLength={10}
                  />
                  {formErrors.pan && <p className="text-sm text-destructive">{formErrors.pan}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financial_year_start">Financial Year Start *</Label>
                  <Input
                    id="financial_year_start"
                    type="date"
                    value={formData.financial_year_start}
                    onChange={handleChange}
                    className={formErrors.financial_year_start ? 'border-destructive' : ''}
                  />
                  {formErrors.financial_year_start && <p className="text-sm text-destructive">{formErrors.financial_year_start}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financial_year_end">Financial Year End *</Label>
                  <Input
                    id="financial_year_end"
                    type="date"
                    value={formData.financial_year_end}
                    onChange={handleChange}
                    className={formErrors.financial_year_end ? 'border-destructive' : ''}
                  />
                  {formErrors.financial_year_end && <p className="text-sm text-destructive">{formErrors.financial_year_end}</p>}
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating || isCreating}>
                  {isUpdating || isCreating ? 'Saving...' : company ? 'Save Changes' : 'Create Company'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}