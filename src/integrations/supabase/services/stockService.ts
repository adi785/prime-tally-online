import { supabase } from '../client';
import {
  StockItem,
  CreateStockItemRequest,
  UpdateStockItemRequest,
  StockQueryParams,
} from '../types';

export class StockService {
  async getStockItems(userId: string, params?: StockQueryParams): Promise<StockItem[]> {
    let query = supabase
      .from('stock_items')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    if (params?.groupId) {
      query = query.eq('group_id', params.groupId);
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
      .eq('is_active', true)
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
        ...data,
        user_id: userId,
        quantity,
        rate,
        value: quantity * rate,
        is_active: true, // Ensure is_active is set on creation
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
        // is_active is not typically updated here unless explicitly requested
      })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('is_active', true)
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
      .update({ is_active: false }) // Set is_active to false for soft delete
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('deleteStockItem failed:', error);
      throw error;
    }
  }
}

export const stockService = new StockService();