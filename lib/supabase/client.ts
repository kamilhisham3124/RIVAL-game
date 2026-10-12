import { createBrowserClient } from '@supabase/ssr';
/** Integration boundary only. Local play does not silently create an account or upload data. */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase is not configured. Local play remains available.');
  return createBrowserClient(url, key);
}
