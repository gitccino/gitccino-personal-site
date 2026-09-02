import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useComments, useCreateComment, useDeleteComment, type Thread } from "@/hooks/api/use-comments";
import type { Comment } from "@/lib/api/comments";
import { ApiError } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AVATAR_COLORS = [
  "var(--color-me-blue)",
  "var(--color-me-yellow)",
  "var(--color-me-green)",
  "var(--color-me-gray)",
] as const;

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

type ThreadCtx = {
  subject: string;
  threads: Thread[];
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
  openReplyId: string | null;
  setOpenReplyId: (id: string | null) => void;
};

const ThreadContext = createContext<ThreadCtx | null>(null);

function useThread() {
  const ctx = useContext(ThreadContext);
  if (!ctx) throw Error("Thread compound components must be used within <Thread>");
  return ctx;
}

type ItemCtx = { comment: Comment };

const ItemContext = createContext<ItemCtx | null>(null);

function useThreadItem() {
  const ctx = useContext(ItemContext);
  if (!ctx) throw Error("<Thread.Item> is required");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

type ThreadProps = { subject: string; children: React.ReactNode };

export function Thread({ subject, children }: ThreadProps) {
  const { data: threads, isLoading, isError, error, refetch } = useComments(subject);
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);

  const ctx = useMemo<ThreadCtx>(
    () => ({
      subject,
      threads: threads ?? [],
      isLoading,
      isError,
      error: error instanceof ApiError ? error : null,
      refetch,
      openReplyId,
      setOpenReplyId,
    }),
    [subject, threads, isLoading, isError, error, refetch, openReplyId],
  );

  return <ThreadContext.Provider value={ctx}>{children}</ThreadContext.Provider>;
}

// ---------------------------------------------------------------------------
// List — renders the section, handles loading / empty / error states
// ---------------------------------------------------------------------------

function List({ children }: { children: (thread: Thread) => React.ReactNode }) {
  const { threads, isLoading, isError, error, refetch } = useThread();

  if (isLoading) {
    return (
      <section aria-label="Comments" className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex animate-pulse gap-2">
            <div className="size-7 shrink-0 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (isError) {
    return (
      <section aria-label="Comments" className="space-y-2 rounded-md border border-destructive/30 p-3 text-sm">
        <p className="text-destructive">{error?.message ?? "Failed to load comments"}</p>
        <Button variant="outline" size="xs" onClick={() => refetch()}>
          Retry
        </Button>
      </section>
    );
  }

  if (threads.length === 0) {
    return (
      <section aria-label="Comments">
        <p className="py-4 text-center text-xs text-muted-foreground">No comments yet.</p>
      </section>
    );
  }

  return (
    <section aria-label="Comments" className="space-y-6">
      {threads.map((thread) => children(thread))}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

function Item({ comment, children }: { comment: Comment; children: React.ReactNode }) {
  return <ItemContext.Provider value={{ comment }}>{children}</ItemContext.Provider>;
}

// ---------------------------------------------------------------------------
// Header — avatar monogram + author + time
// ---------------------------------------------------------------------------

function Header() {
  const { comment } = useThreadItem();
  const initial = comment.authorName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-foreground/80"
        style={{ background: avatarColor(comment.authorName) }}
        aria-hidden
      >
        {initial}
      </span>
      <span className="truncate text-xs font-medium">{comment.authorName}</span>
      <span className="text-xs text-muted-foreground">·</span>
      <time dateTime={comment.createdAt} title={new Date(comment.createdAt).toLocaleString()} className="shrink-0 text-xs text-muted-foreground">
        {relativeTime(comment.createdAt)}
      </time>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Body
// ---------------------------------------------------------------------------

function Body() {
  const { comment } = useThreadItem();

  if (comment.deleted) {
    return <p className="text-xs italic text-muted-foreground">[deleted]</p>;
  }

  return <p className="whitespace-pre-wrap text-xs/relaxed">{comment.body}</p>;
}

// ---------------------------------------------------------------------------
// Actions — Reply + Delete
// ---------------------------------------------------------------------------

function Actions() {
  const { comment } = useThreadItem();
  const { subject, setOpenReplyId, openReplyId } = useThread();
  const { mutate: deleteComment, isPending } = useDeleteComment(subject);

  // Reply targets the root, even from a reply.
  const replyTarget = comment.parentId ?? comment.id;
  const composerId = `reply-composer-${replyTarget}`;

  const handleDelete = () => {
    if (window.confirm("Delete this comment?")) {
      deleteComment(comment.id);
    }
  };

  return (
    <div className="flex items-center gap-1 opacity-60 transition-opacity duration-120 ease-out hover:opacity-100 max-md:opacity-100">
      <Button
        variant="ghost"
        size="xs"
        aria-expanded={openReplyId === replyTarget}
        aria-controls={composerId}
        onClick={() => setOpenReplyId(openReplyId === replyTarget ? null : replyTarget)}
      >
        Reply
      </Button>
      {comment.canDelete && (
        <Button variant="ghost" size="xs" disabled={isPending} onClick={handleDelete}>
          Delete
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Replies container — indented + rail
// ---------------------------------------------------------------------------

function Replies({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative ml-[14px] border-l border-border pl-4 pt-2">{children}</div>
  );
}

// ---------------------------------------------------------------------------
// Composer — root or inline reply
// ---------------------------------------------------------------------------

function Composer({ parentId }: { parentId?: string }) {
  const { subject, setOpenReplyId } = useThread();
  const { isOpen, getContentProps } = useDisclosure({
    defaultOpen: !parentId, // root composer always open
    onOpenChange: (open) => {
      if (!open && parentId) setOpenReplyId(null);
    },
  });
  const { mutate: create, isPending, error, reset } = useCreateComment(subject);
  const shouldReduce = useReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");

  // Focus textarea when inline composer opens.
  useEffect(() => {
    if (parentId && isOpen) {
      textareaRef.current?.focus();
    }
  }, [parentId, isOpen]);

  const composerId = parentId ? `reply-composer-${parentId}` : undefined;

  const submit = useCallback(() => {
    const trimmed = body.trim();
    if (!trimmed || isPending) return;
    reset();
    create(
      parentId ? { body: trimmed, parentId } : { body: trimmed },
      { onSuccess: () => setBody("") },
    );
  }, [body, isPending, parentId, create, reset]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" && parentId) {
      setOpenReplyId(null);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  // Root composer is always rendered; reply composer goes through AnimatePresence.
  if (!parentId) {
    return (
      <div className="flex items-start gap-2">
        {/* Honeypot */}
        <input name="website" tabIndex={-1} className="sr-only" autoComplete="off" readOnly />
        <Textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          rows={1}
          className="min-h-8"
        />
        <Button
          size="sm"
          variant="default"
          disabled={!body.trim() || isPending}
          onClick={submit}
          className="shrink-0"
        >
          {isPending ? "Sending..." : "Send"}
        </Button>
        {error instanceof ApiError && (
          <p className="text-xs text-destructive">{error.message}</p>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="reply-composer"
          {...getContentProps(composerId ? { id: composerId } as React.HTMLAttributes<HTMLElement> : {})}
          hidden={undefined}
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={
            shouldReduce
              ? { duration: 0 }
              : {
                  height: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
                  opacity: { duration: 0.15, ease: "easeOut" },
                }
          }
        >
          <div className="flex items-start gap-2 py-2">
            <input name="website" tabIndex={-1} className="sr-only" autoComplete="off" readOnly />
            <Textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a reply..."
              rows={1}
              className="min-h-8"
            />
            <Button
              size="sm"
              variant="default"
              disabled={!body.trim() || isPending}
              onClick={submit}
              className="shrink-0"
            >
              {isPending ? "Sending..." : "Send"}
            </Button>
            {error instanceof ApiError && (
              <p className="text-xs text-destructive">{error.message}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Attach sub-components
// ---------------------------------------------------------------------------

Thread.List = List;
Thread.Item = Item;
Thread.Header = Header;
Thread.Body = Body;
Thread.Actions = Actions;
Thread.Replies = Replies;
Thread.Composer = Composer;