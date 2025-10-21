import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Destination = {
  id: string;
  user_id: string | null;
  name: string;
  latitude: number;
  longitude: number;
  category: 'dream' | 'visited' | 'planning';
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  destination_id: string;
  content: string;
  image_url: string | null;
  mood_tags: string[];
  created_at: string;
};
