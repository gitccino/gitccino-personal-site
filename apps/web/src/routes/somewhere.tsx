import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/somewhere")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="space-y-4 p-2">Somewhere :)</div>;
}
