import { NextResponse } from "next/server";
import { initializeStorage } from "@/lib/init-storage";

/**
 * GET /api/setup
 * Initializes storage bucket and DB on first deploy.
 * This endpoint is called automatically by the app on startup
 * (via layout.tsx server-side fetch) when SUPABASE_SERVICE_ROLE_KEY is set.
 */
export async function GET() {
  const storageResult = await initializeStorage();

  return NextResponse.json({
    storage: storageResult,
    timestamp: new Date().toISOString(),
  });
}
