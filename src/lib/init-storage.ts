import { createAdminClient } from "./supabase-admin";

const BUCKET_NAME = "project-files";

/**
 * Automatically creates the 'project-files' storage bucket if it doesn't exist.
 * Called from the /api/setup route on app initialization.
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
export async function initializeStorage(): Promise<{ ok: boolean; message: string }> {
  try {
    const admin = createAdminClient();

    // Check if bucket already exists
    const { data: buckets, error: listError } = await admin.storage.listBuckets();
    if (listError) {
      return { ok: false, message: `Could not list buckets: ${listError.message}` };
    }

    const exists = buckets?.some((b) => b.id === BUCKET_NAME);
    if (exists) {
      return { ok: true, message: `Bucket '${BUCKET_NAME}' already exists.` };
    }

    // Create the bucket
    const { error: createError } = await admin.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: null, // allow all types
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });

    if (createError) {
      return { ok: false, message: `Failed to create bucket: ${createError.message}` };
    }

    console.log(`[init-storage] Bucket '${BUCKET_NAME}' created successfully.`);
    return { ok: true, message: `Bucket '${BUCKET_NAME}' created.` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Don't crash the app if service role key is missing — just log
    console.warn("[init-storage] Skipped (service role key missing or error):", msg);
    return { ok: false, message: msg };
  }
}
