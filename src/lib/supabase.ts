import { createClient } from "@supabase/supabase-js";

// Ensure you have these environment variables set in a .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Anon Key must be provided in environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Required for Electron environments
    // See: https://supabase.com/docs/guides/getting-started/tutorials/with-electron-react#initialize-supabase
    persistSession: true, // Persist session in local storage
  },
});
