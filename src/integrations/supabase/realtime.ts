import { supabase } from './client';
import { 
  Ledger, 
  Voucher, 
  StockItem,
  LedgerRealTimeEvent,
  VoucherRealTimeEvent,
  StockRealTimeEvent
} from './types';

export interface RealTimeSubscription {
  unsubscribe: () => void;
}

class RealTimeService {
  private subscriptions: Map<string, RealTimeSubscription> = new Map();

  // Ledger subscriptions
  subscribeToLedgers(
    onInsert?: (data: Ledger) => void,
    onUpdate?: (data: Ledger) => void,
    onDelete?: (data: Ledger) => void
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
              if (onInsert) onInsert(payload.new as Ledger);
              break;
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new as Ledger);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old as Ledger);
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
    onUpdate?: (data: Ledger) => void,
    onDelete?: (data: Ledger) => void
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
              if (onUpdate) onUpdate(payload.new as Ledger);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old as Ledger);
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
    onInsert?: (data: Voucher) => void,
    onUpdate?: (data: Voucher) => void,
    onDelete?: (data: Voucher) => void
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
              if (onInsert) onInsert(payload.new as Voucher);
              break;
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new as Voucher);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old as Voucher);
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
    onUpdate?: (data: Voucher) => void,
    onDelete?: (data: Voucher) => void
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
              if (onUpdate) onUpdate(payload.new as Voucher);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old as Voucher);
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

  // Stock subscriptions
  subscribeToStockItems(
    onInsert?: (data: StockItem) => void,
    onUpdate?: (data: StockItem) => void,
    onDelete?: (data: StockItem) => void
  ): RealTimeSubscription {
    const subscription = supabase
      .channel('stock_items')
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
              if (onInsert) onInsert(payload.new as StockItem);
              break;
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new as StockItem);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old as StockItem);
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
    onUpdate?: (data: StockItem) => void,
    onDelete?: (data: StockItem) => void
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
              if (onUpdate) onUpdate(payload.new as StockItem);
              break;
            case 'DELETE':
              if (onDelete) onDelete(payload.old as StockItem);
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