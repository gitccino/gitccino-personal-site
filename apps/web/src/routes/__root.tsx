import { Button } from "@/components/ui/button";
import { Bug02Icon, FavouriteIcon, Home04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useLikes, useToggleLike } from "@/hooks/api/use-likes";
import { toSubject } from "@/lib/api/subject";
import { Thread } from "@/components/self-ui/thread";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const LINKS = [
  // { to: "/", label: "Home" },
  { to: "/compound-components", label: "Compound components" },
  { to: "/headless-hook-prop-getters", label: "Behavior-only headless hook" },
  { to: "/polymorphic-as-prop", label: "Polymorphic as prop" },
  { to: "/aschild", label: "asChild: Understand the Slot pattern" },
] as const;

function toggleLayoutDebugging() {
  document.documentElement.classList.toggle("debug-on");
}

export const RootLayout = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const subject = toSubject(pathname);
  const { data } = useLikes(subject);
  const toggleLike = useToggleLike(subject);

  return (
    <>
      <div className="mt-4 flex flex-wrap justify-between gap-x-4 gap-y-2 p-2 md:mt-24">
        <div className="flex space-x-1 debug">
          <Button
            size="icon"
            variant="outline"
            nativeButton={false}
            render={(props) => <Link key="/" to="/" {...props}></Link>}
          >
            {/*<Link key="/" to="/">*/}
            <HugeiconsIcon icon={Home04Icon} size={14} color="currentColor" strokeWidth={2} />
            {/*</Link>*/}
          </Button>
          <Button
            size="default"
            variant="outline"
            disabled={toggleLike.isPending}
            onClick={() => toggleLike.mutate()}
            className={`${data?.liked && "bg-me-destructive-soft/10"} flex items-center gap-1`}
          >
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={14}
              fill={data?.liked ? "var(--color-me-destructive-soft)" : "var(--bg)"}
              color={data?.liked ? "var(--color-me-destructive-soft)" : "currentColor"}
              strokeWidth={2}
            />
            <span className="text-xs">{data?.count}</span>
          </Button>
        </div>

        <Button
          size="icon"
          variant="outline"
          onClick={toggleLayoutDebugging}
          className="debugging:bg-me-green"
        >
          <HugeiconsIcon icon={Bug02Icon} size={14} color="currentColor" strokeWidth={2} />
        </Button>
        {/*{LINKS.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className="whitespace-nowrap opacity-50"
          activeProps={{ className: "text-me-primary font-medium opacity-100" }}
        >
          {label}
        </Link>
      ))}*/}
      </div>

      <div className="pb-40">
        <Outlet />
        <Thread subject={subject}>
          <Thread.Composer />
          <Thread.List>
            {(thread) => (
              <Thread.Item key={thread.root.id} comment={thread.root}>
                <Thread.Header />
                <Thread.Body />
                <Thread.Actions />
                {thread.replies.length > 0 && (
                  <Thread.Replies>
                    {thread.replies.map((reply) => (
                      <Thread.Item key={reply.id} comment={reply}>
                        <Thread.Header />
                        <Thread.Body />
                        <Thread.Actions />
                      </Thread.Item>
                    ))}
                  </Thread.Replies>
                )}
                <Thread.Composer parentId={thread.root.id} />
              </Thread.Item>
            )}
          </Thread.List>
        </Thread>
      </div>
      {/*<TanStackRouterDevtools />*/}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
