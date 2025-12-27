import { supabase } from '../client';
import { Company, UpdateCompanyRequest } from '../types';

export class CompanyService {
  async getCompany(): Promise<Company> {
    console.log('getCompany called');
    
    // Use the Supabase function to get company info
    const { data, error } = await supabase.rpc('get_company_info');
      
    if (error) {
      console.error('getCompany error:', error);
      throw error;
    }
    
    console.log('getCompany success, data:', data);
    return data;
  }

  async updateCompany(data: UpdateCompanyRequest): Promise<Company> {
    console.log('updateCompany called with data:', data);
    
    // Use the Supabase function to update company
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
    
    // Fetch the updated company
    const { data: result } = await supabase.rpc('get_company_info');
    
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