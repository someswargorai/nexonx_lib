import * as React from "react";
import { cn } from "../lib/utils/cn";

type TypographyElement =
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "p" | "span" | "div" | "label" | "blockquote";

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement> {
  as?: TypographyElement;
  lines?: 1 | 2 | 3 | 4;
}

const lineClampMap: Record<number, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
};

const defaultStylesByTag: Record<TypographyElement, string> = {
  h1: "text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50",
  h2: "text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50",
  h3: "text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50",
  h4: "text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50",
  h5: "text-lg font-medium text-zinc-900 dark:text-zinc-50",
  h6: "text-base font-medium text-zinc-900 dark:text-zinc-50",
  p: "text-base font-normal text-zinc-600 dark:text-zinc-400",
  span: "text-base font-normal text-zinc-600 dark:text-zinc-400",
  div: "text-base font-normal text-zinc-600 dark:text-zinc-400",
  label: "text-sm font-medium text-zinc-700 dark:text-zinc-300",
  blockquote: "text-base italic text-zinc-500 dark:text-zinc-400 border-l-2 border-zinc-200 dark:border-white/15 pl-4",
};

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ as = "p", lines, className, children, ...props }, ref) => {
    const Tag = as as React.ElementType;

    return (
      <Tag
        ref={ref}
        className={cn(
          defaultStylesByTag[as],
          lines && lineClampMap[lines],
          lines && "break-words",
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

Typography.displayName = "Typography";