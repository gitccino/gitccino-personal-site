import { createContext, useContext, useId, useState } from "react";

/**
 * Compound component
 */
type TabsCtx = {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsCtx | null>(null);

function useTabs(component: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be rendered inside <Tabs>`);
  return ctx;
}

type TabsProps = {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
};

export function Tabs({ children, defaultValue = "", value, onValueChange }: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const baseId = useId();

  // Controlled if `value` is provided, otherwise internal state.
  const current = value ?? uncontrolled;
  const setValue = (v: string) => {
    if (value === undefined) setUncontrolled(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value: current, setValue, baseId }}>
      {children}
    </TabsContext.Provider>
  );
}

function List({ children, ...rest }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div role="tablist" {...rest}>
      {children}
    </div>
  );
}

type TriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  value: string;
};

function Trigger({ value, children, onClick, onKeyDown, ...rest }: TriggerProps) {
  const tabs = useTabs("Tabs.Trigger");
  const selected = tabs.value === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${tabs.baseId}-tab-${value}`}
      aria-controls={`${tabs.baseId}-panel-${value}`}
      aria-selected={selected}
      // Roving tabindex: only the active tab is in the tab order.
      tabIndex={selected ? 0 : -1}
      onClick={(e) => {
        tabs.setValue(value);
        onClick?.(e);
      }}
      onKeyDown={(e) => {
        // ponytail: read siblings off the DOM instead of a ref registry.
        // Swap to a registry only if triggers stop being direct children of the tablist.
        const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (dir) {
          e.preventDefault();
          const tabList = e.currentTarget.closest('[role="tablist"]');
          const items = Array.from(
            tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
          );
          const next = items[(items.indexOf(e.currentTarget) + dir + items.length) % items.length];
          next?.focus();
          next?.click();
        }
        onKeyDown?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

type PanelProps = React.ComponentPropsWithoutRef<"div"> & { value: string };

function Panel({ value, children, ...rest }: PanelProps) {
  const tabs = useTabs("Tabs.Panel");
  if (tabs.value !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${tabs.baseId}-panel-${value}`}
      aria-labelledby={`${tabs.baseId}-tab-${value}`}
      tabIndex={0}
      {...rest}
    >
      {children}
    </div>
  );
}

// Namespacing. Signals the parts belong together; keeps one import.
Tabs.List = List;
Tabs.Trigger = Trigger;
Tabs.Panel = Panel;
