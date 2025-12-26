import { nhost } from './client';
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
    const subscription = nhost.graphql.client
      .subscribe({
        query: `
          subscription {
            ledgers {
              id
              name
              group_id
              opening_balance
              current_balance
              address
              phone
              gstin
              email
              is_billwise
              is_inventory
              created_at
              updated_at
            }
          }
        `,
      })
      .subscribe({
        next: (data) => {
          const ledgers = data.data?.ledgers || [];
          ledgers.forEach((ledger: Ledger) => {
            if (onInsert) onInsert(ledger);
          });
        },
        error: (error) => {
          console.error('Ledger subscription error:', error);
        },
      });

    const id = `ledgers-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        subscription.unsubscribe();
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
    const subscription = nhost.graphql.client
      .subscribe({
        query: `
          subscription ($id: uuid!) {
            ledgers_by_pk(id: $id) {
              id
              name
              group_id
              opening_balance
              current_balance
              address
              phone
              gstin
              email
              is_billwise
              is_inventory
              created_at
              updated_at
            }
          }
        `,
        variables: { id: ledgerId },
      })
      .subscribe({
        next: (data) => {
          const ledger = data.data?.ledgers_by_pk;
          if (ledger && onUpdate) onUpdate(ledger);
        },
        error: (error) => {
          console.error('Ledger subscription error:', error);
        },
      });

    const id = `ledger-${ledgerId}-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        subscription.unsubscribe();
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
    const subscription = nhost.graphql.client
      .subscribe({
        query: `
          subscription {
            vouchers {
              id
              voucher_number
              type_id
              date
              party_ledger_id
              narration
              total_amount
              created_at
              updated_at
              items {
                id
                ledger_id
                amount
                type
              }
            }
          }
        `,
      })
      .subscribe({
        next: (data) => {
          const vouchers = data.data?.vouchers || [];
          vouchers.forEach((voucher: Voucher) => {
            if (onInsert) onInsert(voucher);
          });
        },
        error: (error) => {
          console.error('Voucher subscription error:', error);
        },
      });

    const id = `vouchers-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        subscription.unsubscribe();
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
    const subscription = nhost.graphql.client
      .subscribe({
        query: `
          subscription ($id: uuid!) {
            vouchers_by_pk(id: $id) {
              id
              voucher_number
              type_id
              date
              party_ledger_id
              narration
              total_amount
              created_at
              updated_at
              items {
                id
                ledger_id
                amount
                type
              }
            }
          }
        `,
        variables: { id: voucherId },
      })
      .subscribe({
        next: (data) => {
          const voucher = data.data?.vouchers_by_pk;
          if (voucher && onUpdate) onUpdate(voucher);
        },
        error: (error) => {
          console.error('Voucher subscription error:', error);
        },
      });

    const id = `voucher-${voucherId}-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        subscription.unsubscribe();
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
    const subscription = nhost.graphql.client
      .subscribe({
        query: `
          subscription {
            stock_items {
              id
              name
              unit
              quantity
              rate
              value
              group_name
              created_at
              updated_at
            }
          }
        `,
      })
      .subscribe({
        next: (data) => {
          const stockItems = data.data?.stock_items || [];
          stockItems.forEach((stockItem: StockItem) => {
            if (onInsert) onInsert(stockItem);
          });
        },
        error: (error) => {
          console.error('Stock subscription error:', error);
        },
      });

    const id = `stock-items-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        subscription.unsubscribe();
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
    const subscription = nhost.graphql.client
      .subscribe({
        query: `
          subscription ($id: uuid!) {
            stock_items_by_pk(id: $id) {
              id
              name
              unit
              quantity
              rate
              value
              group_name
              created_at
              updated_at
            }
          }
        `,
        variables: { id: stockItemId },
      })
      .subscribe({
        next: (data) => {
          const stockItem = data.data?.stock_items_by_pk;
          if (stockItem && onUpdate) onUpdate(stockItem);
        },
        error: (error) => {
          console.error('Stock subscription error:', error);
        },
      });

    const id = `stock-item-${stockItemId}-${Date.now()}`;
    this.subscriptions.set(id, {
      unsubscribe: () => {
        subscription.unsubscribe();
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