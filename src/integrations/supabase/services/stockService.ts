import { supabase } from '../client';
import {
  StockItem,
  CreateStockItemRequest,
  UpdateStockItemRequest,
  StockQueryParams,
} from '../customTypes';

export class StockService {
  async getStockItems(userId: string, params?: StockQueryParams): Promise<StockItem[]> {
    let query = supabase
      .from('stock_items')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    if (params?.group) {
      query = query.eq('group_name', params.group);
    }

    const { data, error } = await query;

    if (error) {
      console.error('getStockItems failed:', error);
      throw error;
    }

    return data ?? [];
  }

  async getStockItem(userId: string, id: string): Promise<StockItem | null> {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('getStockItem failed:', error);
      throw error;
    }

    return data;
  }

  async createStockItem(
    userId: string,
    data: CreateStockItemRequest
  ): Promise<StockItem> {
    const quantity = data.quantity ?? 0;
    const rate = data.rate ?? 0;

    const { data: result, error } = await supabase
      .from('stock_items')
      .insert({
        name: data.name,
        group_name: data.group_name ?? 'Primary',
        unit: data.unit ?? 'Nos',
        user_id: userId,
        quantity,
        rate,
        value: quantity * rate,
        reorder_level: data.reorder_level ?? 0,
      })
      .select()
      .single();

    if (error || !result) {
      console.error('createStockItem failed:', error);
      throw error ?? new Error('Stock item creation failed');
    }

    return result;
  }

  async updateStockItem(
    userId: string,
    id: string,
    data: UpdateStockItemRequest
  ): Promise<StockItem> {
    const quantity = data.quantity ?? 0;
    const rate = data.rate ?? 0;

    const { data: result, error } = await supabase
      .from('stock_items')
      .update({
        name: data.name,
        unit: data.unit,
        quantity,
        rate,
        value: quantity * rate,
        group_name: data.group_name,
        reorder_level: data.reorder_level,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error || !result) {
      console.error('updateStockItem failed:', error);
      throw error ?? new Error('Stock item not found or update blocked');
    }

    return result;
  }

  async deleteStockItem(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('deleteStockItem failed:', error);
      throw error;
    }
  }
}

export const stockService = new StockService();