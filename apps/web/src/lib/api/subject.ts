export type Subject = "home" | `article:${string}`;

// pathname e.g. /compound-component -> compound-component
export function toSubject(pathname: string): Subject {
  if (pathname === "/") return "home";
  const slug = pathname.slice(1);
  return `article:${slug}` as Subject;
}
