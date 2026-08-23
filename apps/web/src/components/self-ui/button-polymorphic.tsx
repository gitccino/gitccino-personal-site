import type React from "react";

type BaseButtonProps = {
  variant?: "default" | "outline";
  size?: "sm" | "md";
  children: React.ReactNode;
};

type PolymorphicButtonProps<T extends React.ElementType> = {
  as?: T;
} & BaseButtonProps &
  React.ComponentPropsWithoutRef<T>;

//Omit<React.ComponentPropsWithoutRef<T>, keyof BaseButtonProps | "as">;

export function Button<T extends React.ElementType = "button">({
  as,
  variant = "outline",
  size = "sm",
  children,
  className = "",
  ...props
}: PolymorphicButtonProps<T>) {
  const Component = as || "button";

  const baseClasses =
    "w-fit flex h-7 shrink-0 items-center justify-center gap-1 rounded-md px-2 font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50";
  const variantClasses = {
    default: "bg-me-secondary/90 hover:bg-me-secondary text-white",
    outline: "border border-border hover:bg-input/50 hover:text-foreground",
  };
  const sizeClasses = {
    sm: "text-sm/relaxed",
    md: "text-base/relaxed",
  };
  const classNames = [
    className,
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
  ].join(" ");
  return (
    <Component className={classNames} {...props}>
      {children}
    </Component>
  );
}
