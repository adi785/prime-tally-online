import { AlertCircle, Clock, FileWarning, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardMetrics } from '@/integrations/supabase/hooks'; // Import useDashboardMetrics
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PendingItem {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'urgent';
  count?: number;
}

const typeConfig = {
  warning: {
    icon: <AlertCircle size={16} />,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20'
  },
  info: {
    icon: <Clock size={16} />,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20'
  },
  urgent: {
    icon: <FileWarning size={16} />,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20'
  }
};

export function PendingItems() {
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  const pendingItems: PendingItem[] = [];

  if (metrics) {
    if (metrics.pendingInvoices > 0) {
      pendingItems.push({ 
        id: '1', 
        title: 'Pending Invoices', 
        description: `${metrics.pendingInvoices} invoices awaiting payment`, 
        type: 'warning', 
        count: metrics.pendingInvoices 
      });
    }
    // Removed hardcoded pending items to rely solely on dynamic data from metrics or other backend sources.
    // If real system activities are to be implemented, they should be fetched from a backend.
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Pending Tasks</h3>
          <p className="text-sm text-muted-foreground">Items requiring attention</p>
        </div>
        <div className="p-8 text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Pending Tasks</h3>
          <p className="text-sm text-muted-foreground">Items requiring attention</p>
        </div>
        <div className="p-8 text-center text-destructive">
          <AlertCircle size={24} className="mx-auto mb-2" />
          <p>Error loading pending items.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Pending Tasks</h3>
        <p className="text-sm text-muted-foreground">Items requiring attention</p>
      </div>
      <div className="divide-y divide-border">
        {pendingItems.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p>No pending tasks!</p>
          </div>
        ) : (
          pendingItems.map((item, index) => {
            const config = typeConfig[item.type];
            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 hover:bg-muted/30 transition-colors cursor-pointer group animate-slide-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    config.bgColor,
                    config.color
                  )}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{item.title}</p>
                      {item.count && (
                        <span className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          config.bgColor,
                          config.color
                        )}>
                          {item.count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}