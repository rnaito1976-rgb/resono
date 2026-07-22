import { createClient } from "@/lib/supabase/client";

const BUCKET = "member-photos";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadMemberPhoto(
  memberId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "JPEG, PNG, WebP, GIF のみ対応しています" };
  }

  if (file.size > MAX_SIZE) {
    return { error: "ファイルサイズは5MB以下にしてください" };
  }

  const supabase = createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${memberId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
