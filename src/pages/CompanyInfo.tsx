import { useState } from 'react'
import { useCompany, useUpdateCompany } from '@/integrations/supabase/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function CompanyInfo() {
  const { data: company, isLoading } = useCompany()
  const { mutate: updateCompany, isPending } = useUpdateCompany()
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

  useState(() => {
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
    }
  }, [company])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (company?.id) {
      updateCompany({ id: company.id, ...formData })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="Enter GSTIN"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter company address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    value={formData.pan}
                    onChange={handleChange}
                    placeholder="Enter PAN number"
                  />
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
                  <Label htmlFor="financial_year_start">Financial Year Start</Label>
                  <Input
                    id="financial_year_start"
                    type="date"
                    value={formData.financial_year_start}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financial_year_end">Financial Year End</Label>
                  <Input
                    id="financial_year_end"
                    type="date"
                    value={formData.financial_year_end}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}