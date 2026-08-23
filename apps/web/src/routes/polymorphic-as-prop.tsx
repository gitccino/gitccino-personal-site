import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { codeToHtml } from "shiki";
import { Button } from "@/components/self-ui/button-polymorphic";

export const Route = createFileRoute("/polymorphic-as-prop")({
  component: RouteComponent,
});

const wrongButton = `<button className="btn btn-primary" onClick={() => navigate("/somewhere")}>
  Pricing
</button>
`;

const polymorphic = `<Button
  as={Link}
  to="/somewhere"
  size="sm"
  variant="outline"
  className="mx-auto my-10"
>
  Go to somewhere the right way
</Button>

// ❌ TypeScript will complain - buttons don't have href
<Button href="/somewhere">Won't compile</Button>
`;

const [wrongButtonHtml, polymorphicHtml] = await Promise.all(
  [wrongButton, polymorphic].map((code) =>
    codeToHtml(code, { lang: "tsx", theme: "one-light" }),
  ),
);

const code =
  "[&_pre]:p-4 [&_pre]:text-xs [&_pre]:rounded-lg [&_pre]:overflow-x-auto";

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div className="p-2 space-y-4 pb-100">
      <p className="text-me-primary font-medium">
        Polymorphic components and the as prop
      </p>

      <div className=" text-me-secondary space-y-3">
        <div className="space-y-2">
          <p>
            Let's take a look at this button element. It shows up on a form
            submit, a link to somewhere.
          </p>
          <button
            className="w-fit mx-auto my-10 flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border border-border bg-clip-padding px-2 text-sm/relaxed font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-input/50 hover:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
            onClick={() => navigate({ to: "/somewhere" })}
          >
            Somewhere
          </button>
          <div
            className={code}
            dangerouslySetInnerHTML={{ __html: wrongButtonHtml }}
          />
          <p>
            This button is a lie. <code className="highlighter">cmd+click</code>
            doesn't open a new tab. Right-click has no{" "}
            {/*<code className="highlighter whitespace-nowrap">*/}
            "Copy Link Address"
            {/*</code>*/}. Screen reader says "button," so a user looking for
            links never finds it.
          </p>
        </div>

        <div className="space-y-2">
          <p>
            Building a Proper Polymorphic component. A Button component that can
            render as any HTML element or React component while preserving full
            type safety.
          </p>
          <div
            className={code}
            dangerouslySetInnerHTML={{ __html: polymorphicHtml }}
          />
          <Button
            as={Link}
            to="/somewhere"
            size="sm"
            variant="outline"
            className="mx-auto my-10"
          >
            Go to somewhere the right way
          </Button>

          {/*<Button href="/somewhere">Won't compile</Button>*/}
          <p className="text-me-secondary">
            Try <code className="generalighter">cmd+click</code> it to open a
            new tab, or right-click and choose{" "}
            <code className="generalighter">Copy Link Address</code>.
          </p>
          <p>
            Use it when one reusable component should keep its styling/behavior
            but render as any HTML elements or React components.
          </p>
        </div>
      </div>
    </div>
  );
}
