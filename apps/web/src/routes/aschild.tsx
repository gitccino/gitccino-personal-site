import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/aschild")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4 p-2 pb-100">
      <p className="font-medium">asChild: Understand the Slot pattern</p>

      <div className="space-y-3">
        <div className="space-y-2">
          <p>
            Imaging a Button that needs to render as a native{" "}
            <code className="highlighter">
              {"<"}button{">"}
            </code>
            , an{" "}
            <code className="highlighter">
              {"<"}a{">"}
            </code>{" "}
            tag for external links, or a Tanstack{" "}
            <code className="highlighter">
              {"<"}Link{">"}
            </code>{" "}
            for navigation, while maintaining the exact same styles, hover states, and logic from
            the design system.
          </p>
          <p>
            You can solve this by using Polymorphic as prop pattern or the Slot pattern. Your
            component provides the skin and behavior, while the consumer provides the underlying
            element.
          </p>
        </div>
      </div>
    </div>
  );
}
