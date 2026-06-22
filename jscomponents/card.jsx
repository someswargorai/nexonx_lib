import React from "react";
import { cn } from "../lib/utils/cn";
import { cva } from "class-variance-authority";

const cardVariants = cva(
  "rounded-xl border transition-all duration-200 ease-out overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-white border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-300/80",
        secondary:
          "bg-gray-50 border-gray-200/80 shadow-sm hover:bg-gray-100/80",
        destructive:
          "bg-red-50 border-red-200/80 shadow-sm hover:border-red-300/80",
        outline:
          "bg-transparent border-gray-200 hover:bg-gray-50/60",
        ghost:
          "bg-transparent border-transparent hover:bg-gray-100/70",
        elevated:
          "bg-white border-gray-200/60 shadow-md hover:shadow-lg hover:-translate-y-0.5",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const paddingMap = {
  sm: "p-4",
  md: "p-5",
  lg: "p-7",
};

const gapMap = {
  sm: "gap-1",
  md: "gap-1.5",
  lg: "gap-2",
};

const lineClampMap = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
};

export const Card = ({
  className,
  variant,
  size = "md",
  title,
  description,
  icon,
  imageSrc,
  imageAlt = "",
  imageAspectRatio = "16/9",
  imageSizes = "(max-width: 768px) 100vw, 400px",
  imagePriority = false,
  titleLines = 1,
  descriptionLines = 2,
  children,
  ...props
}) => {
  const resolvedSize = size ?? "md";

  return (
    <div
      className={cn(
        cardVariants({ variant, size }),
        "flex flex-col",
        className,
      )}
      {...props}
    >
      {imageSrc && (
        <div
          className="relative w-full shrink-0 overflow-hidden bg-gray-100"
          style={{ aspectRatio: imageAspectRatio }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            sizes={imageSizes}
            fetchpriority={imagePriority ? "high" : undefined}
            className="object-cover border-b border-gray-100 "
          />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col",
          paddingMap[resolvedSize],
          gapMap[resolvedSize],
        )}
      >
        {icon && (
          <div className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900/5 text-gray-700">
            {icon}
          </div>
        )}

        {title && (
          <p
            className={cn(
              "font-semibold tracking-tight text-gray-900 break-words",
              lineClampMap[titleLines],
            )}
            title={title}
          >
            {title}
          </p>
        )}

        {description && (
          <p
            className={cn(
              "text-sm leading-relaxed text-gray-500 break-words",
              lineClampMap[descriptionLines],
            )}
            title={description}
          >
            {description}
          </p>
        )}

        {children}
      </div>
    </div>
  );
};
