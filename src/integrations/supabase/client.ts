import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vrmbazbiwkzxntqbooyu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybWJhemJpd2t6eG50cWJvb3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTE5MTYsImV4cCI6MjA4MjMyNzkxNn0.ZiyzAMlj1UlxNrdwZsZecOwL3RqRC5wD2KEw5-0gKzc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);