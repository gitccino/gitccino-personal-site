import { createContext, useContext, useId, useState } from "react";
import { Button, buttonVariants } from "../ui/button";
import type { VariantProps } from "class-variance-authority";

// Create the context
type TabsCtx = {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsCtx | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx)
    throw Error(`Tabs compound components must be used within Tabs.Root`);
  return ctx;
}

type TabsProps = {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
};

export function Tabs({
  children,
  defaultValue = "",
  value,
  onValueChange,
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const baseId = useId();

  // controlled if `value` is provided, otherwise internal useState
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
} & VariantProps<typeof buttonVariants>;

function Trigger({
  value,
  variant = "outline",
  size = "default",
  children,
  onClick,
  ...rest
}: TriggerProps) {
  const tabs = useTabs();
  const selected = tabs.value === value;
  return (
    <Button
      role="tab"
      variant={variant}
      size={size}
      aria-selected={selected}
      aria-controls={`${tabs.baseId}-panel-${value}`}
      onClick={(e) => {
        tabs.setValue(value);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}

type PanelProps = React.ComponentPropsWithoutRef<"div"> & { value: string };

function Panel({ value, children, ...rest }: PanelProps) {
  const tabs = useTabs();
  if (tabs.value !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${tabs.baseId}-panel-${value}`}
      aria-labelledby={`${tabs.baseId}-tab-${value}`}
      {...rest}
    >
      {children}
    </div>
  );
}

Tabs.List = List;
Tabs.Trigger = Trigger;
Tabs.Panel = Panel;
