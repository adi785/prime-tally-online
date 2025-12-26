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
    const channel = supabase
      .channel('ledgers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ledgers',
        },
        (payload) => {
          const ledger = payload.new as Ledger;
          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) onInsert(ledger);
              break;
            case 'UPDATE':
              if (onUpdate) onUpdate(ledger);
              break;
            case 'DELETE':
              if (onDelete) onDelete(ledger);
              break;
          }
        }
      )
      .subscribe();

    const id = `ledgers-${Date.now()}`;
    const subscription = {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(id);
      },
    };

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  subscribeToLedger(
    ledgerId: string,
    onUpdate?: (data: Ledger) => void,
    onDelete?: (data: Ledger) => void
  ): RealTimeSubscription {
    const channel = supabase
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
          const ledger = payload.new as Ledger;
          switch (payload.eventType) {
            case 'UPDATE':
              if (onUpdate) onUpdate(ledger);
              break;
            case 'DELETE':
              if (onDelete) onDelete(ledger);
              break;
          }
        }
      )
      .subscribe();

    const id = `ledger-${ledgerId}-${Date.now()}`;
    const subscription = {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(id);
      },
    };

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  // Voucher subscriptions
  subscribeToVouchers(
    onInsert?: (data: Voucher) => void,
    onUpdate?: (data: Voucher) => void,
    onDelete?: (data: Voucher) => void
  ): RealTimeSubscription {
    const channel = supabase
      .channel('vouchers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vouchers',
        },
        (payload) => {
          const voucher = payload.new as Voucher;
          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) onInsert(voucher);
              break;
            case 'UPDATE':
              if (onUpdate) onUpdate(voucher);
              break;
            case 'DELETE':
              if (onDelete) onDelete(voucher);
              break;
          }
        }
      )
      .subscribe();

    const id = `vouchers-${Date.now()}`;
    const subscription = {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(id);
      },
    };

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  subscribeToVoucher(
    voucherId: string,
    onUpdate?: (data: Voucher) => void,
    onDelete?: (data: Voucher) => void
  ): RealTimeSubscription {
    const channel = supabase
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
          const voucher = payload.new as Voucher;
          switch (payload.eventType) {
            case 'UPDATE':
              if (onUpdate) onUpdate(voucher);
              break;
            case 'DELETE':
              if (onDelete) onDelete(voucher);
              break;
          }
        }
      )
      .subscribe();

    const id = `voucher-${voucherId}-${Date.now()}`;
    const subscription = {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(id);
      },
    };

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  // Stock subscriptions
  subscribeToStockItems(
    onInsert?: (data: StockItem) => void,
    onUpdate?: (data: StockItem) => void,
    onDelete?: (data: StockItem) => void
  ): RealTimeSubscription {
    const channel = supabase
      .channel('stock_items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_items',
        },
        (payload) => {
          const stockItem = payload.new as StockItem;
          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) onInsert(stockItem);
              break;
            case 'UPDATE':
              if (onUpdate) onUpdate(stockItem);
              break;
            case 'DELETE':
              if (onDelete) onDelete(stockItem);
              break;
          }
        }
      )
      .subscribe();

    const id = `stock-items-${Date.now()}`;
    const subscription = {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(id);
      },
    };

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  subscribeToStockItem(
    stockItemId: string,
    onUpdate?: (data: StockItem) => void,
    onDelete?: (data: StockItem) => void
  ): RealTimeSubscription {
    const channel = supabase
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
          const stockItem = payload.new as StockItem;
          switch (payload.eventType) {
            case 'UPDATE':
              if (onUpdate) onUpdate(stockItem);
              break;
            case 'DELETE':
              if (onDelete) onDelete(stockItem);
              break;
          }
        }
      )
      .subscribe();

    const id = `stock-item-${stockItemId}-${Date.now()}`;
    const subscription = {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(id);
      },
    };

    this.subscriptions.set(id, subscription);
    return subscription;
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