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
    userId: string, // Added userId
    onInsert?: (data: Ledger) => void,
    onUpdate?: (data: Ledger) => void,
    onDelete?: (data: Ledger) => void
  ): RealTimeSubscription {
    const channel = supabase
      .channel(`ledgers_for_user_${userId}`) // Unique channel per user
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ledgers',
          filter: `user_id=eq.${userId}`, // Filter by user_id
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

    const id = `ledgers-${userId}-${Date.now()}`;
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
    userId: string, // Added userId
    ledgerId: string,
    onUpdate?: (data: Ledger) => void,
    onDelete?: (data: Ledger) => void
  ): RealTimeSubscription {
    const channel = supabase
      .channel(`ledger_${ledgerId}_for_user_${userId}`) // Unique channel per user and ledger
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ledgers',
          filter: `id=eq.${ledgerId}&user_id=eq.${userId}`, // Filter by id and user_id
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

    const id = `ledger-${ledgerId}-${userId}-${Date.now()}`;
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
    userId: string, // Added userId
    onInsert?: (data: Voucher) => void,
    onUpdate?: (data: Voucher) => void,
    onDelete?: (data: Voucher) => void
  ): RealTimeSubscription {
    const channel = supabase
      .channel(`vouchers_for_user_${userId}`) // Unique channel per user
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vouchers',
          filter: `user_id=eq.${userId}`, // Filter by user_id
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

    const id = `vouchers-${userId}-${Date.now()}`;
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
    userId: string, // Added userId
    voucherId: string,
    onUpdate?: (data: Voucher) => void,
    onDelete?: (data: Voucher) => void
  ): RealTimeSubscription {
    const channel = supabase
      .channel(`voucher_${voucherId}_for_user_${userId}`) // Unique channel per user and voucher
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vouchers',
          filter: `id=eq.${voucherId}&user_id=eq.${userId}`, // Filter by id and user_id
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

    const id = `voucher-${voucherId}-${userId}-${Date.now()}`;
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
    userId: string, // Added userId
    onInsert?: (data: StockItem) => void,
    onUpdate?: (data: StockItem) => void,
    onDelete?: (data: StockItem) => void
  ): RealTimeSubscription {
    const channel = supabase
      .channel(`stock_items_for_user_${userId}`) // Unique channel per user
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_items',
          filter: `user_id=eq.${userId}`, // Filter by user_id
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

    const id = `stock-items-${userId}-${Date.now()}`;
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
    userId: string, // Added userId
    stockItemId: string,
    onUpdate?: (data: StockItem) => void,
    onDelete?: (data: StockItem) => void
  ): RealTimeSubscription {
    const channel = supabase
      .channel(`stock_item_${stockItemId}_for_user_${userId}`) // Unique channel per user and item
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_items',
          filter: `id=eq.${stockItemId}&user_id=eq.${userId}`, // Filter by id and user_id
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

    const id = `stock-item-${stockItemId}-${userId}-${Date.now()}`;
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