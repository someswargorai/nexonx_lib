import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils/cn";

const loaderVariants = cva("animate-spin", {
  variants: {
    variant: {
      default: "text-zinc-900 dark:text-zinc-100",
      muted: "text-zinc-400 dark:text-zinc-500",
      destructive: "text-red-600 dark:text-red-500",
      outline: "text-zinc-600 dark:text-zinc-400",
    },
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-7 w-7",
      xl: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
});

export interface LoaderProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "size">,
    VariantProps<typeof loaderVariants> {
  label?: string;
}

export const Loader = React.forwardRef<SVGSVGElement, LoaderProps>(
  ({ className, variant, size, label = "Loading", ...props }, ref) => {
    return (
      <Loader2
        ref={ref}
        className={cn(loaderVariants({ variant, size }), className)}
        role="status"
        aria-label={label}
        {...props}
      />
    );
  }
);

Loader.displayName = "Loader";