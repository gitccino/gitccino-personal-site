import { api, unwrap } from "./client";

export function fetchComments(subject: string) {
  return unwrap(api.comments.get({ query: { subject } }));
}

export function createComment(subject: string, body: string) {
  return unwrap(api.comments.post({ subject, body }));
}

export function deleteComment(id: string) {
  return unwrap(api.comments({ id }).delete());
}

export type Comment = Awaited<ReturnType<typeof fetchComments>>[number];
