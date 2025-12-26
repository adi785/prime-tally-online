import { Building2, MapPin, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { company } from '@/data/mockData';
import { Button } from '@/components/ui/button';

export function CompanyInfo() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Company Information</h1>
        <p className="text-muted-foreground">View and manage company details</p>
      </div>
      
      {/* Company Card */}
      <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-tally-blue to-tally-purple flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {company.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{company.name}</h2>
              <div className="mt-2 space-y-1">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={16} />
                  {company.address}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={16} />
                  {company.phone}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={16} />
                  {company.email}
                </p>
              </div>
            </div>
          </div>
          <Button>Edit Company</Button>
        </div>
        
        {/* Company Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GSTIN</p>
                <p className="font-mono font-semibold">{company.gstin}</p>
              </div>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PAN</p>
                <p className="font-mono font-semibold">{company.pan}</p>
              </div>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Financial Year Start</p>
                <p className="font-semibold">
                  {new Date(company.financialYearStart).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Financial Year End</p>
                <p className="font-semibold">
                  {new Date(company.financialYearEnd).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statutory Details */}
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">Statutory Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tax Registration</p>
              <p className="font-medium">GST Registered</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tax Period</p>
              <p className="font-medium">Monthly</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Books Begin From</p>
              <p className="font-medium">
                {new Date(company.financialYearStart).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Banking Details */}
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">Banking Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Primary Bank</p>
              <p className="font-medium">HDFC Bank</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-mono font-medium">50100XXXXXXX789</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IFSC Code</p>
              <p className="font-mono font-medium">HDFC0001234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}