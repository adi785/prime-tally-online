import { supabase } from '../client';
import { Company, UpdateCompanyRequest } from '../types';

export class CompanyService {
  async getCompany(): Promise<Company> {
    console.log('getCompany called');
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .single();
      
    if (error) {
      console.error('getCompany error:', error);
      throw error;
    }
    
    console.log('getCompany success, data:', data);
    return data;
  }

  async updateCompany(data: UpdateCompanyRequest): Promise<Company> {
    console.log('updateCompany called with data:', data);
    
    const { data: result, error } = await supabase
      .from('companies')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
      
    if (error) {
      console.error('updateCompany error:', error);
      throw error;
    }
    
    console.log('updateCompany success, result:', result);
    return result;
  }

  async createCompany(data: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> {
    console.log('createCompany called with data:', data);
    
    const { data: result, error } = await supabase
      .from('companies')
      .insert([data])
      .select()
      .single();
      
    if (error) {
      console.error('createCompany error:', error);
      throw error;
    }
    
    console.log('createCompany success, result:', result);
    return result;
  }
}

export const companyService = new CompanyService();