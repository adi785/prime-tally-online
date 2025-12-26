import { supabase } from './client';

export interface RealTimeSubscription {
  unsubscribe: () => void;
}

class RealTimeService {
  private subscriptions: Map<string, RealTimeSubscription> = new Map();

  // Ledger subscriptions
  subscribeToLedgers(
    onInsert?: (data: any) => void,
    onUpdate?: (data: any) => void,
    onDelete?: (data: any) => void
  ): RealTimeSubscription {
    const subscription = supabase
      .channel('ledgers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ledgers',
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) onInsert(payload.new);
              break;
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old);
              break;
          }
        }
      )
      .subscribe();

    const id = `ledgers-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        supabase.removeChannel(subscription);
        this.subscriptions.delete(id);
      },
    });

    return this.subscriptions.get(id)!;
  }

  subscribeToLedger(
    ledgerId: string,
    onUpdate?: (data: any) => void,
    onDelete?: (data: any) => void
  ): RealTimeSubscription {
    const subscription = supabase
      .channel(`ledger-${ledgerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ledgers',
          filter: `id=eq.${ledgerId}`,
        },
        (payload) => {
          switch (payload.eventType) {
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old);
              break;
          }
        }
      )
      .subscribe();

    const id = `ledger-${ledgerId}-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        supabase.removeChannel(subscription);
        this.subscriptions.delete(id);
      },
    });

    return this.subscriptions.get(id)!;
  }

  // Voucher subscriptions
  subscribeToVouchers(
    onInsert?: (data: any) => void,
    onUpdate?: (data: any) => void,
    onDelete?: (data: any) => void
  ): RealTimeSubscription {
    const subscription = supabase
      .channel('vouchers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vouchers',
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) onInsert(payload.new);
              break;
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old);
              break;
          }
        }
      )
      .subscribe();

    const id = `vouchers-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        supabase.removeChannel(subscription);
        this.subscriptions.delete(id);
      },
    });

    return this.subscriptions.get(id)!;
  }

  subscribeToVoucher(
    voucherId: string,
    onUpdate?: (data: any) => void,
    onDelete?: (data: any) => void
  ): RealTimeSubscription {
    const subscription = supabase
      .channel(`voucher-${voucherId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vouchers',
          filter: `id=eq.${voucherId}`,
        },
        (payload) => {
          switch (payload.eventType) {
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old);
              break;
          }
        }
      )
      .subscribe();

    const id = `voucher-${voucherId}-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        supabase.removeChannel(subscription);
        this.subscriptions.delete(id);
      },
    });

    return this.subscriptions.get(id)!;
  }

  // Voucher items subscriptions
  subscribeToVoucherItems(
    onInsert?: (data: any) => void,
    onUpdate?: (data: any) => void,
    onDelete?: (data: any) => void
  ): RealTimeSubscription {
    const subscription = supabase
      .channel('voucher-items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voucher_items',
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) onInsert(payload.new);
              break;
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old);
              break;
          }
        }
      )
      .subscribe();

    const id = `voucher-items-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        supabase.removeChannel(subscription);
        this.subscriptions.delete(id);
      },
    });

    return this.subscriptions.get(id)!;
  }

  // Stock subscriptions
  subscribeToStockItems(
    onInsert?: (data: any) => void,
    onUpdate?: (data: any) => void,
    onDelete?: (data: any) => void
  ): RealTimeSubscription {
    const subscription = supabase
      .channel('stock-items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_items',
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) onInsert(payload.new);
              break;
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old);
              break;
          }
        }
      )
      .subscribe();

    const id = `stock-items-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        supabase.removeChannel(subscription);
        this.subscriptions.delete(id);
      },
    });

    return this.subscriptions.get(id)!;
  }

  subscribeToStockItem(
    stockItemId: string,
    onUpdate?: (data: any) => void,
    onDelete?: (data: any) => void
  ): RealTimeSubscription {
    const subscription = supabase
      .channel(`stock-item-${stockItemId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_items',
          filter: `id=eq.${stockItemId}`,
        },
        (payload) => {
          switch (payload.eventType) {
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old);
              break;
          }
        }
      )
      .subscribe();

    const id = `stock-item-${stockItemId}-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        supabase.removeChannel(subscription);
        this.subscriptions.delete(id);
      },
    });

    return this.subscriptions.get(id)!;
  }

  // Company subscriptions
  subscribeToCompany(
    onUpdate?: (data: any) => void
  ): RealTimeSubscription {
    const subscription = supabase
      .channel('company-info')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'company_info',
        },
        (payload) => {
          if (onUpdate) onUpdate(payload.new);
        }
      )
      .subscribe();

    const id = `company-info-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        supabase.removeChannel(subscription);
        this.subscriptions.delete(id);
      },
    });

    return this.subscriptions.get(id)!;
  }

  // Unsubscribe from all subscriptions
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  // Get subscription count
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

export const realTimeService = new RealTimeService();