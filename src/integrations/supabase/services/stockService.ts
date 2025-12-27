import { supabase } from '../client';
import {
  StockItem,
  CreateStockItemRequest,
  UpdateStockItemRequest,
  StockQueryParams,
} from '../types';

export class StockService {
  // ==============================
  // READ: Multiple Stock Items
  // ==============================
  async getStockItems(params?: StockQueryParams): Promise<StockItem[]> {
    let query = supabase
      .from('stock_items')
      .select('*')
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

  // ==============================
  // READ: Single Stock Item
  // ==============================
  async getStockItem(id: string): Promise<StockItem | null> {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('getStockItem failed:', error);
      throw error;
    }

    return data;
  }

  // ==============================
  // CREATE
  // ==============================
  async createStockItem(
    data: CreateStockItemRequest
  ): Promise<StockItem> {
    const quantity = data.quantity ?? 0;
    const rate = data.rate ?? 0;

    const { data: result, error } = await supabase
      .from('stock_items')
      .insert({
        name: data.name,
        unit: data.unit,
        quantity,
        rate,
        value: quantity * rate,
        group_id: data.group_id,
        is_active: true,
      })
      .select()
      .single();

    if (error || !result) {
      console.error('createStockItem failed:', error);
      throw error ?? new Error('Stock item creation failed');
    }

    return result;
  }

  // ==============================
  // UPDATE
  // ==============================
  async updateStockItem(
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
        group_id: data.group_id,
      })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .maybeSingle();

    if (error || !result) {
      console.error('updateStockItem failed:', error);
      throw error ?? new Error('Stock item not found or update blocked');
    }

    return result;
  }

  // ==============================
  // DELETE (Soft Delete – ERP Safe)
  // ==============================
  async deleteStockItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('stock_items')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('deleteStockItem failed:', error);
      throw error;
    }
  }
}

export const stockService = new StockService();
