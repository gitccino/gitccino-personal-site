import { createComment, deleteComment, fetchComments } from "@/lib/api/comments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment } from "@/lib/api/comments";

export type Thread = { root: Comment; replies: Comment[] };

export function useComments(subject: string) {
  return useQuery({
    queryKey: ["comments", subject],
    queryFn: () => fetchComments(subject),
    select: (rows): Thread[] => {
      const byParent = new Map<string, Comment[]>();
      for (const row of rows) {
        if (!row.parentId) continue;
        const bucket = byParent.get(row.parentId);
        if (bucket) bucket.push(row);
        else byParent.set(row.parentId, [row]);
      }
      return rows
        .filter((row) => !row.parentId)
        .map((root) => ({
          root,
          // server sends newest first; a conversation reads oldest first
          replies: (byParent.get(root.id) ?? []).slice().reverse(),
        }));
    },
  });
}

export function useCreateComment(subject: string) {
  const queryClient = useQueryClient();
  const key = ["comments", subject] as const;

  return useMutation({
    mutationFn: ({ body, parentId }: { body: string; parentId?: string }) =>
      createComment(subject, body, parentId),

    onMutate: async ({ body, parentId }) => {
      if (!parentId) return; // roots stay non-optimistic
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Comment[]>(key);

      // This visitor's own name, if they have commented here before.
      const mine = previous?.find((c) => c.canDelete)?.authorName;
      if (!mine) return { previous }; // first-ever comment: no name to fake

      const tempId = crypto.randomUUID();
      const now = new Date().toISOString();
      const optimistic: Comment = {
        id: tempId,
        parentId,
        authorName: mine,
        body,
        deleted: false,
        createdAt: now,
        updatedAt: now,
        canDelete: true,
      };
      queryClient.setQueryData<Comment[]>(key, (rows) => [optimistic, ...(rows ?? [])]);
      return { previous, tempId };
    },

    onSuccess: (created, _vars, context) => {
      queryClient.setQueryData<Comment[]>(key, (rows) =>
        context?.tempId
          ? rows?.map((c) => (c.id === context.tempId ? created : c))
          : [created, ...(rows ?? [])],
      );
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
  });
}

export function useDeleteComment(subject: string) {
  const queryClient = useQueryClient();
  const key = ["comments", subject] as const;

  return useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}