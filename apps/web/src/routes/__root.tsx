import { Button } from "@/components/ui/button";
import { Bug02Icon, Home04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
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

export const RootLayout = () => (
  <>
    <div className="mt-4 flex flex-wrap justify-between gap-x-4 gap-y-2 p-2 md:mt-24">
      <Button
        size="icon"
        variant="outline"
        render={(props) => <Link key="/" to="/" {...props}></Link>}
      >
        {/*<Link key="/" to="/">*/}
        <HugeiconsIcon icon={Home04Icon} size={14} color="currentColor" strokeWidth={2} />
        {/*</Link>*/}
      </Button>
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
    </div>
    {/*<TanStackRouterDevtools />*/}
  </>
);

export const Route = createRootRoute({ component: RootLayout });
