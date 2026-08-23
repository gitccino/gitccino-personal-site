import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/somewhere")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="p-2 space-y-4">Somewhere :)</div>;
}
