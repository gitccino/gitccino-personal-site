import { useCallback, useId, useRef, useState } from "react";

// Run the caller's handler first; skip ours if they called preventDefault.
function compose<E extends React.SyntheticEvent>(
  theirs: ((e: E) => void) | undefined,
  ours: (e: E) => void,
) {
  console.log("compose");
  return (e: E) => {
    theirs?.(e);
    if (!e.defaultPrevented) ours(e);
  };
}

type DisclosureOptions = {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function useDisclosure({ defaultOpen = false, onOpenChange }: DisclosureOptions = {}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = useId();
  const triggerRef = useRef<HTMLElement>(null);

  const set = useCallback(
    (next: boolean) => {
      setIsOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const open = useCallback(() => set(true), [set]);
  const close = useCallback(() => set(false), [set]);
  const toggle = useCallback(() => set(!isOpen), [isOpen, set]);

  const getTriggerProps = useCallback(
    <P extends React.HTMLAttributes<HTMLElement>>(props: P = {} as P) => ({
      ...props,
      ref: triggerRef,
      "aria-expanded": isOpen,
      "aria-controls": `${id}-content`,
      id: `${id}-trigger`,
      // onClick: toggle,
      onClick: compose(props.onClick, toggle),
      // onKeydown: close,
      onKeyDown: compose(props.onKeyDown, (e: React.KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) close();
      }),
    }),
    [isOpen, id, toggle, close],
  );

  // const getContentProps = useCallback(
  //   <P extends React.HTMLAttributes<HTMLElement>>(props: P = {} as P) => ({
  //     ...props,
  //     id: `${id}-content`,
  //     "aria-labelledby": `${id}-trigger`,
  //     hidden: !isOpen,
  //   }),
  //   [isOpen, id],
  // );

  // Motion suitable version
  // Drop the four handler names motion.div redefines with its own signatures
  const getContentProps = useCallback(
    <P extends React.HTMLAttributes<HTMLElement>>(props: P = {} as P) =>
      ({
        ...props,
        id: `${id}-content`,
        "aria-labelledby": `${id}-trigger`,
        hidden: !isOpen,
      }) as Omit<P, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd">,
    [isOpen, id],
  );

  return { isOpen, open, close, toggle, getTriggerProps, getContentProps };
}
