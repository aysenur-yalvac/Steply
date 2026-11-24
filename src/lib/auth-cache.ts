import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

export type CachedProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  country: string | null;
  university: string | null;
  institution: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  total_score: number | null;
  badges: string[] | null;
  is_public: boolean | null;
};

/**
 * Request-scoped cached auth user lookup.
 * Shared across layout.tsx and nested Server Components within a single request
 * so Supabase auth.getUser() is only executed once per navigation.
 */
export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});

export const getCurrentUser = getCachedUser;

/**
 * Request-scoped cached profile lookup for the authenticated user.
 * Fetches only the commonly needed profile fields once per request.
 */
export const getCachedProfile = cache(async (): Promise<any | null> => {
  const user = await getCachedUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[getCachedProfile] error:", error.message);
  }

  return data ?? null;
});
