import { createComment, deleteComment, fetchComments } from "@/lib/api/comments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment } from "@/lib/api/comments";

export function useComment(subject: string) {
  return useQuery({
    queryKey: ["comments", subject],
    queryFn: () => fetchComments(subject),
  });
}

export function useCreateComment(subject: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createComment(subject, body),
    onSuccess: (created) => {
      queryClient.setQueryData<Comment[]>(["comments", subject], (existing) => [
        created,
        ...(existing ?? []),
      ]);
    },
    // No optimistic insert: the server assigns id/authorName/createdAt
  });
}

export function useDeleteComment(subject: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: (_deleted, id) => {
      queryClient.setQueryData<Comment[]>(["comments", subject], (existing) =>
        existing?.filter((comment) => comment.id !== id),
      );
    },
  });
}
