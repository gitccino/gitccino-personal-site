import { api, unwrap } from "./client";

export function fetchLikes(subject: string) {
  return unwrap(api.likes.get({ query: { subject } }));
  // return api.likes.get({ query: { subject } });
}

export function toggleLike(subject: string) {
  return unwrap(api.likes.post({ subject }));
  // return api.likes.post({ subject });
}

export type LikeState = Awaited<ReturnType<typeof fetchLikes>>;
