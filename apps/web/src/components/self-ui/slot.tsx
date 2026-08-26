import { Children, cloneElement, isValidElement } from "react";

// children already exists (optional) via HTMLAttributes → DOMAttributes;
// the intersection only makes it required.
type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
};

export function Slot({ children, ...slotProps }: SlotProps) {
  if (!isValidElement(children)) {
    throw new Error("asChild expects exactly one React element child");
  }

  // Children.only throws on 0 or 2+ childrens — cheap validation
  const child = Children.only(children) as React.ReactElement<Record<string, unknown>>;

  return cloneElement(child, mergeProps(slotProps, child.props));
}

function mergeProps(slotProps: Record<string, unknown>, childProps: Record<string, unknown>) {
  const merged: Record<string, unknown> = {};

  for (const key of Object.keys(slotProps)) {
    const slotVal = slotProps[key];
    const childVal = childProps[key];
    void slotVal;
    void childVal;

    // Event handlers run BOTH. Child's first (it's more specific).
    // if (/^on[A-Z]/.test(key) && typeof slotVal === "function") {

    // }
  }
  return merged;
}
