import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // Surfaces a clear message instead of a cryptic network error.
  console.warn("Supabase env vars missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

// Fall back to a syntactically valid placeholder so createClient never throws
// at import time (which would blank the whole app). Calls just fail and pages
// show their error states instead. Real fix is setting the env vars.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-anon-key",
);
