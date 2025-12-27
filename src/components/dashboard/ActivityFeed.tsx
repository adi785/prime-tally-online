import { useState, useEffect } from 'react';
import { useVouchers, useLedgers } from '@/integrations/supabase/hooks';
import { 
  Activity, 
  DollarSign, 
  Users, 
  Package, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ActivityItem {
  id: string;
  type: 'voucher' | 'ledger' | 'system';
  action: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
  status: 'success' | 'warning' | 'info';
}

export function ActivityFeed() {
  const { data: vouchers = [], isLoading: isVouchersLoading, error: vouchersError } = useVouchers();
  const { data: ledgers = [], isLoading: isLedgersLoading, error: ledgersError } = useLedgers();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const generateActivities = () => {
      const newActivities: ActivityItem[] = [];

      // Recent vouchers
      vouchers.slice(0, 5).forEach((voucher) => {
        newActivities.push({
          id: `voucher-${voucher.id}`,
          type: 'voucher',
          action: `${voucher.type?.name.toUpperCase()} Voucher Created`,
          description: `${voucher.party?.name || 'N/A'} - ₹${(voucher.total_amount ?? 0).toLocaleString('en-IN')}`,
          timestamp: new Date(voucher.date).toLocaleString('en-IN'),
          icon: <DollarSign size={16} />,
          color: 'text-success',
          status: 'success',
        });
      });

      // Recent ledger updates (simplified for now, could track actual updates)
      ledgers.slice(0, 3).forEach((ledger) => {
        newActivities.push({
          id: `ledger-${ledger.id}`,
          type: 'ledger',
          action: 'Ledger Created/Updated',
          description: `${ledger.name} balance: ₹${(ledger.current_balance ?? 0).toLocaleString('en-IN')}`,
          timestamp: new Date(ledger.updated_at || ledger.created_at || Date.now()).toLocaleString('en-IN'),
          icon: <Users size={16} />,
          color: 'text-tally-blue',
          status: 'info',
        });
      });

      // System activities (placeholders for now)
      // Removed hardcoded system activities to rely solely on user data or actual system logs.
      // If real system activities are to be implemented, they should be fetched from a backend.

      // Sort by timestamp
      newActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(newActivities);
    };

    if (!isVouchersLoading && !isLedgersLoading) {
      generateActivities();
    }
  }, [vouchers, ledgers, isVouchersLoading, isLedgersLoading]);

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case 'voucher':
        return <DollarSign size={16} />;
      case 'ledger':
        return <Users size={16} />;
      case 'system':
        return status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  if (isVouchersLoading || isLedgersLoading) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Latest actions and updates</p>
        </div>
        <div className="p-8 text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (vouchersError || ledgersError) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Latest actions and updates</p>
        </div>
        <div className="p-8 text-center text-destructive">
          <AlertCircle size={24} className="mx-auto mb-2" />
          <p>Error loading activity feed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest actions and updates</p>
      </div>
      
      <div className="divide-y divide-border max-h-80 overflow-y-auto tally-scrollbar">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Activity size={32} className="mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  activity.status === 'success' && "bg-success/10 text-success",
                  activity.status === 'warning' && "bg-warning/10 text-warning",
                  activity.status === 'info' && "bg-tally-blue/10 text-tally-blue"
                )}>
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{activity.action}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {activity.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 bg-muted/30 text-center">
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          View All Activity →
        </button>
      </div>
    </div>
  );
}