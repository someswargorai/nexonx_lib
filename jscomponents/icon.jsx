import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils/cn";

const iconVariants = cva("shrink-0", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
    },
    color: {
      default: "text-zinc-900 dark:text-zinc-100",
      muted: "text-zinc-400 dark:text-zinc-500",
      primary: "text-indigo-600 dark:text-indigo-400",
      success: "text-emerald-600 dark:text-emerald-400",
      warning: "text-amber-600 dark:text-amber-400",
      danger: "text-red-600 dark:text-red-500",
      current: "text-current",
    },
  },
  defaultVariants: {
    size: "sm",
    color: "default",
  },
});

export const Icon = React.forwardRef(
  ({ icon: IconComponent, size, color, strokeWidth = 1.75, label, className, ...props }, ref) => {
    return (
      <IconComponent
        ref={ref}
        className={cn(iconVariants({ size, color }), className)}
        strokeWidth={strokeWidth}
        aria-hidden={label ? undefined : true}
        aria-label={label}
        role={label ? "img" : undefined}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";
