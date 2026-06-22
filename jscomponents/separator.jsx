import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils/cn";

const separatorVariants = cva("shrink-0 bg-zinc-200 dark:bg-white/10", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : orientation ?? "horizontal"}
        className={cn(separatorVariants({ orientation }), className)}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";
