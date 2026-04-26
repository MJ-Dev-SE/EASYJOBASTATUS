import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Only initialize if we have credentials to avoid top-level crash during deployment
// when environment variables are not yet configured.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey) 
  : createClient<Database>('https://placeholder.supabase.co', 'placeholder'); // placeholder to prevent crash
