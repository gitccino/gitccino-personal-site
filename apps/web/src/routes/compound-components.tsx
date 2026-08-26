import { Tabs } from "@/components/self-ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { codeToHtml } from "shiki";

export const Route = createFileRoute("/compound-components")({
  component: RouteComponent,
});

const propsSoup = `<Tabs
  tabs={[
    { label: "Digest", content: <Digest /> },
    { label: "Feedback", content: <Feedback /> },
  ]}
  activeTab={active}
  onTabChange={setActive}
  tabListClassName="..."
  activeTabClassName="..."
  renderTab={(tab, isActive) => <span>{tab.label}</span>}
/>`;

const compound = `<Tabs defaultValue="digest">
  <Tabs.List className="flex gap-2">
    <Tabs.Trigger value="digest">Digest</Tabs.Trigger>
    <Tabs.Trigger value="feedback">Feedback</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Panel value="digest"><Digest /></Tabs.Panel>
  <Tabs.Panel value="feedback"><Feedback /></Tabs.Panel>
</Tabs>`;

const [htmlPropsSoup, htmlCompound] = await Promise.all(
  [propsSoup, compound].map((code) => codeToHtml(code, { lang: "tsx", theme: "one-light" })),
);

const code = "[&_pre]:p-4 [&_pre]:text-xs [&_pre]:rounded-lg [&_pre]:overflow-x-auto";

export function RouteComponent() {
  return (
    <div className="space-y-4 p-2 pb-100">
      <p className="font-medium text-me-primary">Understand Compound components</p>

      <div className="space-y-3 text-me-secondary">
        <div className="my-10 space-y-2">
          <p>
            You build a tab component. Then someone needs X more configuration options. So you add
            another prop to it. Now the component becomes a black box that controls too much layout.
          </p>
          <div className={code} dangerouslySetInnerHTML={{ __html: htmlPropsSoup }} />
        </div>

        <div className="my-10 space-y-2">
          <p>
            Compound components hand the arrangement back to the consumer. Same component, no config
            props.
          </p>
          <div className={code} dangerouslySetInnerHTML={{ __html: htmlCompound }} />
          {/*<p>
            No <code className="highlighter">tabs</code> array, no{" "}
            <code className="highlighter">renderTab</code>, no className props.
            A divider between triggers is now just a{" "}
            <code className="highlighter">&lt;div&gt;</code> — zero API change.
          </p>*/}
        </div>
      </div>

      <blockquote>
        Compound components expose structural control to the consumer (Gain layout freedom), you
        lose the ability to enforce arrangement. Nothing stops a consumer from omitting a Panel, and
        the parts are coupled by a <code className="highlighter">value</code> string. A typo is a
        silent no-op, not a type error.
      </blockquote>

      <Tabs defaultValue="digest">
        <Tabs.List className="flex justify-center space-x-2 p-10">
          <Tabs.Trigger value="digest">Digest</Tabs.Trigger>
          <Tabs.Trigger value="when-to-use">When to use</Tabs.Trigger>
        </Tabs.List>

        {/*<Tabs.Panel value="digest">
          The compound component pattern ia a techniques for creating flexible,
          reusable components that can handle complex requirements. Instead of
          cramming all functionality into a single component with dozens of
          props, compound components distribute responsibility across multiple
          cooperating components.
        </Tabs.Panel>*/}
        <Tabs.Panel value="digest">
          Instead of cramming functionality into one component with dozens of props, compound
          components distribute responsibility across multiple cooperating parts that share state
          through context.
        </Tabs.Panel>
        <Tabs.Panel value="when-to-use">
          Suffering from Prop Bloat, you can't predict how consumers will arrange the parts or UI
          layout needs to be highly flexible.
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
