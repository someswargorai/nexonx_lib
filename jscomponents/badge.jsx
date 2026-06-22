import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: `
          bg-zinc-100 text-zinc-700
          dark:bg-white/10 dark:text-zinc-300
        `,
        primary: `
          bg-indigo-50 text-indigo-700
          dark:bg-indigo-500/15 dark:text-indigo-300
        `,
        success: `
          bg-emerald-50 text-emerald-700
          dark:bg-emerald-500/15 dark:text-emerald-300
        `,
        warning: `
          bg-amber-50 text-amber-700
          dark:bg-amber-500/15 dark:text-amber-300
        `,
        danger: `
          bg-red-50 text-red-700
          dark:bg-red-500/15 dark:text-red-300
        `,
        outline: `
          bg-transparent text-zinc-600 shadow-[0_0_0_1px_rgba(0,0,0,0.12)_inset]
          dark:text-zinc-300 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.14)_inset]
        `,
      },
      size: {
        sm: "h-5 px-3 text-[11px]",
        md: "h-6 px-4 text-xs",
        lg: "h-7 px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export const Badge = React.forwardRef(
  ({ className, variant, size, dot = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
