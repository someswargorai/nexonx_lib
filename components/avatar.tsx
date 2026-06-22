"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { User } from "lucide-react";
import { cn } from "../lib/utils/cn";

const avatarVariants = cva(
  `
  relative inline-flex shrink-0 items-center justify-center
  select-none
  bg-zinc-100 text-zinc-600
  dark:bg-zinc-800 dark:text-zinc-300
`,
  {
    variants: {
      shape: {
        circle: "rounded-full",
        square: "rounded-lg",
      },
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
    },
    defaultVariants: {
      shape: "circle",
      size: "md",
    },
  }
);

const statusVariants = cva(
  `
  absolute rounded-full
  ring-2 ring-white dark:ring-zinc-950 z-10
`,
  {
    variants: {
      status: {
        online: "bg-emerald-500",
        offline: "bg-zinc-400 dark:bg-zinc-500",
        away: "bg-amber-500",
        busy: "bg-red-500",
      },
      size: {
        xs: "h-1.5 w-1.5",
        sm: "h-2 w-2",
        md: "h-2.5 w-2.5",
        lg: "h-3 w-3",
        xl: "h-3.5 w-3.5",
      },
    },
    defaultVariants: {
      status: "offline",
      size: "md",
    },
  }
);

const statusPositionMap = {
  circle: {
    xs: "bottom-0 right-0",
    sm: "bottom-0 right-0",
    md: "bottom-0 right-0",
    lg: "bottom-0.5 right-0.5",
    xl: "bottom-0.5 right-0.5",
  },
  square: {
    xs: "-bottom-0.5 -right-0.5",
    sm: "-bottom-0.5 -right-0.5",
    md: "-bottom-0.5 -right-0.5",
    lg: "-bottom-1 -right-1",
    xl: "-bottom-1 -right-1",
  },
} as const;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
  status?: VariantProps<typeof statusVariants>["status"];
  showStatus?: boolean;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      className,
      shape = "circle",
      size = "md",
      src,
      alt = "",
      name,
      status,
      showStatus = true,
      ...props
    },
    ref
  ) => {
    const [imageState, setImageState] = React.useState<"loading" | "loaded" | "error">(
      src ? "loading" : "error"
    );

    React.useEffect(() => {
      setImageState(src ? "loading" : "error");
    }, [src]);

    const resolvedShape = shape ?? "circle";
    const resolvedSize = size ?? "md";
    const initials = name ? getInitials(name) : "";

    return (
      <span
        ref={ref}
        className={cn(avatarVariants({ shape, size }), className)}
        {...props}
      >
        <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]">
          {src && imageState !== "error" && (
            <img
              src={src}
              alt={alt || name || "Avatar"}
              className={cn(
                "h-full w-full object-cover transition-opacity duration-200",
                imageState === "loaded" ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageState("loaded")}
              onError={() => setImageState("error")}
            />
          )}

          {(imageState === "error" || (src && imageState === "loading")) && (
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center font-medium",
                imageState === "loading" && "animate-pulse"
              )}
              aria-hidden={imageState === "loading"}
            >
              {imageState === "error" && initials ? (
                initials
              ) : (
                <User className="h-[55%] w-[55%]" strokeWidth={1.75} />
              )}
            </span>
          )}
        </span>

        {status && showStatus && (
          <span
            className={cn(
              statusVariants({ status, size }),
              "absolute",
              statusPositionMap[resolvedShape][resolvedSize]
            )}
            role="status"
            aria-label={status}
          />
        )}
      </span>
    );
  }
);

Avatar.displayName = "Avatar";