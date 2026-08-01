import { apiFetch } from "@/lib/api/client";

export interface UploadCommentImageResult {
  url: string;
}

export async function uploadCommentImage(
  file: File
): Promise<UploadCommentImageResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/v1/storage/comment-images", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.status}`);
  }

  return (await response.json()) as UploadCommentImageResult;
}
