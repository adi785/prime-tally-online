import { supabase } from '../client';
import { UserSettings, UpdateUserSettingsRequest } from '../types';

export class SettingsService {
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    console.log('getUserSettings called');
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('getUserSettings error:', error);
      throw error;
    }
    
    console.log('getUserSettings success, data:', data);
    return data;
  }

  async updateUserSettings(userId: string, data: UpdateUserSettingsRequest): Promise<UserSettings> {
    console.log('updateUserSettings called with data:', data);
    
    const { id, ...updates } = data;

    const { data: result, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error || !result) {
      console.error('updateUserSettings error:', error);
      throw error ?? new Error('Failed to update user settings');
    }
    
    console.log('updateUserSettings success, result:', result);
    return result;
  }
}

export const settingsService = new SettingsService();