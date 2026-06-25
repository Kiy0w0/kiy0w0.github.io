import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // Surfaces a clear message instead of a cryptic network error.
  console.warn("Supabase env vars missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(url ?? "", key ?? "");
