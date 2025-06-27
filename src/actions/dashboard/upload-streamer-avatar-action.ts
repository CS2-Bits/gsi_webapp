"use server";
import { ActionResponse } from "@/types/action-response";
import { storageClient } from "@/lib/supabase";

export async function uploadStreamerAvatarAction(
  id: string,
  file: File
): Promise<ActionResponse<string>> {
  // Ensure the file is valid
  if (!file || !file.type.match(/^image\/(jpeg|jpg|png)$/)) {
    throw new Error("Invalid file provided for upload.");
  }

  if (file.size > 5 * 1024 * 1024) {
    // 5 MB limit
    throw new Error("File size exceeds the 5 MB limit.");
  }

  // Upload the file to Supabase Storage
  const { data, error } = await storageClient
    .from("streamers-avatar")
    .upload(`${id}`, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }

  const publicUrl = storageClient
    .from("streamers-avatar")
    .getPublicUrl(data.path);

  // Return the public URL of the uploaded file
  return {
    success: true,
    data: publicUrl.data.publicUrl,
  };
}
