import { fetchLikes, toggleLike, type LikeState } from "@/lib/api/likes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useLikes(subject: string) {
  return useQuery({
    queryKey: ["likes", subject],
    queryFn: () => fetchLikes(subject),
  });
}

export function useToggleLike(subject: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleLike(subject),
    // onMutate — callback that fires before the mutation function executes
    onMutate: async () => {
      const key = ["likes", subject] as const;
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<LikeState>(key);
      if (previous) {
        queryClient.setQueryData(key, {
          count: previous.count + +(previous.liked ? -1 : 1),
          liked: !previous.liked,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["likes", subject], context.previous);
      }
    },
    // onSettled — fires when a mutation is either successful or has errored
    onSettled: () => {
      // Marks matching queries as stale and optionally refetches active ones
      queryClient.invalidateQueries({ queryKey: ["likes", subject] });
    },
  });
}
