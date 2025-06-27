import { StorageClient } from "@supabase/storage-js";

export const storageClient = new StorageClient(
  process.env.SUPABASE_STORAGE_URL!,
  {
    apikey: process.env.SUPABASE_API_KEY!,
    Authorization: `Bearer ${process.env.SUPABASE_API_KEY!}`,
  }
);
