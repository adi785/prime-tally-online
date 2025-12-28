import { supabase } from '../client';
import { Company, UpdateCompanyRequest } from '../types';

export class CompanyService {
  async getCompany(userId: string): Promise<Company | null> {
    console.log('getCompany called');
    
    const { data, error } = await supabase.rpc('get_company_info')
      .maybeSingle();

    if (error) {
      console.error('getCompany error:', error);
      throw error;
    }
    
    console.log('getCompany success, data:', data);
    return data as Company | null; // Explicitly cast
  }

  async updateCompany(userId: string, data: UpdateCompanyRequest): Promise<Company> {
    console.log('updateCompany called with data:', data);
    
    const { error } = await supabase.rpc('update_company', {
      p_id: data.id,
      p_name: data.name,
      p_address: data.address,
      p_gstin: data.gstin,
      p_pan: data.pan,
      p_phone: data.phone,
      p_email: data.email,
      p_financial_year_start: data.financial_year_start,
      p_financial_year_end: data.financial_year_end
    });
    
    if (error) {
      console.error('updateCompany error:', error);
      throw error;
    }
    
    const { data: result, error: fetchError } = await supabase.rpc('get_company_info')
      .maybeSingle();

    if (fetchError || !result) {
      console.error('updateCompany fetch error:', fetchError);
      throw fetchError ?? new Error('Updated company not retrievable');
    }
    
    console.log('updateCompany success, result:', result);
    return result as Company; // Explicitly cast
  }

  async createCompany(userId: string, data: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Company> {
    console.log('createCompany called with data:', data);
    
    const { data: result, error } = await supabase
      .from('companies')
      .insert([{ ...data, user_id: userId }])
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