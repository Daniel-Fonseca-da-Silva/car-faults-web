"use server";

import { appendCursorParams, toSearchString } from "@/lib/api/cursor";
import { serverApiFetch } from "@/lib/api/server-client";
import type { Comment } from "@/types/comment";
import type { CursorPage, CursorQuery } from "@/types/cursor";

export interface CreateCommentInput {
  knownIssueId: string;
  body: string;
  imageUrl?: string | null;
}

export interface UpdateCommentInput {
  body: string;
  imageUrl?: string | null;
}

export async function listComments(
  knownIssueId: string,
  query: CursorQuery = {}
): Promise<CursorPage<Comment>> {
  const params = new URLSearchParams({ knownIssueId });
  appendCursorParams(params, query);
  const response = await serverApiFetch(
    `/v1/comments${toSearchString(params)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load comments: ${response.status}`);
  }

  return (await response.json()) as CursorPage<Comment>;
}

export async function createComment(
  input: CreateCommentInput
): Promise<Comment> {
  const response = await serverApiFetch("/v1/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to create comment: ${response.status}`);
  }

  return (await response.json()) as Comment;
}

export async function updateComment(
  id: string,
  input: UpdateCommentInput
): Promise<Comment> {
  const response = await serverApiFetch(`/v1/comments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to update comment: ${response.status}`);
  }

  return (await response.json()) as Comment;
}

export async function deleteComment(id: string): Promise<void> {
  const response = await serverApiFetch(`/v1/comments/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete comment: ${response.status}`);
  }
}
