import { createClient } from "@supabase/supabase-js";

function isPlaceholder(value: string) {
  return value.includes("your-project") || value.includes("your-service-role-key");
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) return null;
  if (isPlaceholder(url) || isPlaceholder(serviceRoleKey)) return null;
  if (!url.startsWith("https://") || !url.endsWith(".supabase.co")) return null;

  return { serviceRoleKey, url };
}

export function isSupabaseConfigured() {
  return getSupabaseConfig() !== null;
}

export function getSupabaseAdmin() {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}
