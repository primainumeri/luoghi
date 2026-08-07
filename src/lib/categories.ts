import { supabase } from './supabase';
import type { Category } from './types';

// Legge le categorie attive (config pubblica).
export async function fetchActiveCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, label, color, icon, types, active, sort')
    .eq('active', true)
    .order('sort', { ascending: true });

  if (error) {
    throw error;
  }
  return (data ?? []) as Category[];
}
