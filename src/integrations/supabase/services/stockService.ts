import { supabase } from '../client';
import { 
  StockItem, 
  CreateStockItemRequest,
  UpdateStockItemRequest,
  StockQueryParams
} from '../types';

export class StockService {
  async getStockItems(params?: StockQueryParams): Promise<StockItem[]> {
    console.log('getStockItems called with params:', params);
    let query = supabase.from('stock_items').select('*');
    
    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    
    if (params?.group) {
      query = query.eq('group_name', params.group);
    }
    
    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) {
      console.error('getStockItems error:', error);
      throw error;
    }
    console.log('getStockItems success, data:', data);
    return data || [];
  }

  async getStockItem(id: string): Promise<StockItem> {
    console.log('getStockItem called with id:', id);
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('getStockItem error:', error);
      throw error;
    }
    console.log('getStockItem success, data:', data);
    return data;
  }

  async createStockItem(data: CreateStockItemRequest): Promise<StockItem> {
    console.log('createStockItem called with data:', data);
    const { data: result, error } = await supabase
      .from('stock_items')
      .insert([{
        name: data.name,
        unit: data.unit,
        quantity: data.quantity,
        rate: data.rate,
        value: data.value,
        group_name: data.group_name,
      }])
      .select()
      .single();
    
    if (error) {
      console.error('createStockItem error:', error);
      throw error;
    }
    console.log('createStockItem success, result:', result);
    return result;
  }

  async updateStockItem(id: string, data: UpdateStockItemRequest): Promise<StockItem> {
    console.log('updateStockItem called with id:', id, 'data:', data);
    const { data: result, error } = await supabase
      .from('stock_items')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('updateStockItem error:', error);
      throw error;
    }
    console.log('updateStockItem success, result:', result);
    return result;
  }

  async deleteStockItem(id: string): Promise<void> {
    console.log('deleteStockItem called with id:', id);
    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('deleteStockItem error:', error);
      throw error;
    }
    console.log('deleteStockItem success');
  }
}

export const stockService = new StockService();