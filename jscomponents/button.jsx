"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils/cn";

const buttonVariants = cva(
  `
  inline-flex items-center justify-center gap-2
  rounded-sm font-medium
  transition-all duration-200
  active:scale-[0.98]
  disabled:pointer-events-none disabled:opacity-50
  outline-none
  focus-visible:ring-2 focus-visible:ring-zinc-400/50

  [&_svg]:size-4 [&_svg]:shrink-0
`,
  {
    variants: {
      variant: {
        default: `
          bg-zinc-950 text-white
          shadow-lg shadow-zinc-950/20
          hover:-translate-y-0.5
          hover:shadow-xl hover:shadow-zinc-950/30
        `,

        secondary: `
          bg-zinc-100 text-zinc-900
          hover:bg-zinc-200
        `,

        outline: `
          border border-zinc-200
          bg-white
          hover:bg-zinc-50
        `,

        ghost: `
          hover:bg-zinc-100
        `,

        destructive: `
          bg-red-600
          text-white
          hover:bg-red-700
        `,
      },

      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5",
        lg: "h-12 px-7 text-base",
        icon: "h-11 w-11",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        className
      )}
      {...props}
    />
  );
}
