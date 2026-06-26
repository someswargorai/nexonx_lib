"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils/cn";

const dialogPanelVariants = cva(
  `
    relative w-full rounded-xl border bg-white
    shadow-[0_8px_30px_-4px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.04)]
    dark:bg-zinc-900 dark:border-white/10
    dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)]
  `,
  {
    variants: {
      size: {
        sm: "max-w-xs",
        md: "max-w-sm",
        lg: "max-w-md",
        xl: "max-w-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface DialogProps extends VariantProps<typeof dialogPanelVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;

  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  hideCloseButton?: boolean;

  // Panel
  className?: string;

  // Customization
  overlayClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closeButtonClassName?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  hideCloseButton = false,

  className,
  overlayClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  bodyClassName,
  footerClassName,
  closeButtonClassName,
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [animateIn, setAnimateIn] = React.useState(false);

  const panelRef = React.useRef<HTMLDivElement>(null);

  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      setVisible(true);

      const raf = requestAnimationFrame(() => {
        setAnimateIn(true);
      });

      return () => cancelAnimationFrame(raf);
    }

    setAnimateIn(false);
  }, [open]);

  const close = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  React.useEffect(() => {
    if (!open || !closeOnEscape) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeOnEscape, close]);

  React.useEffect(() => {
    if (!open) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  React.useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  function handlePanelTransitionEnd(
    e: React.TransitionEvent<HTMLDivElement>
  ) {
    if (e.target !== e.currentTarget) return;

    if (!open) {
      setVisible(false);
    }
  }

  if (!mounted || !visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={closeOnBackdropClick ? close : undefined}
        style={{ opacity: animateIn ? 1 : 0 }}
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-150 dark:bg-black/60",
          overlayClassName
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        onTransitionEnd={handlePanelTransitionEnd}
        style={{
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? "scale(1)" : "scale(.95)",
        }}
        className={cn(
          dialogPanelVariants({ size }),
          "relative overflow-hidden outline-none transition-all duration-150 ease-out",
          className
        )}
      >
        {(title || !hideCloseButton) && (
          <div
            className={cn(
              "flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4 dark:border-white/10",
              headerClassName
            )}
          >
            <div className="flex flex-col gap-0.5">
              {title && (
                <p
                  id={titleId}
                  className={cn(
                    "text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50",
                    titleClassName
                  )}
                >
                  {title}
                </p>
              )}

              {description && (
                <p
                  id={descriptionId}
                  className={cn(
                    "text-sm text-zinc-500 dark:text-zinc-400",
                    descriptionClassName
                  )}
                >
                  {description}
                </p>
              )}
            </div>

            {!hideCloseButton && (
              <button
                type="button"
                onClick={close}
                aria-label="Close dialog"
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-md p-1",
                  "text-zinc-400 transition-colors duration-100",
                  "hover:bg-zinc-100 hover:text-zinc-600",
                  "dark:text-zinc-500 dark:hover:bg-white/10 dark:hover:text-zinc-300",
                  closeButtonClassName
                )}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {children && (
          <div
            className={cn(
              "px-5 py-5 text-sm text-zinc-600 dark:text-zinc-300",
              bodyClassName
            )}
          >
            {children}
          </div>
        )}

        {footer && (
          <div
            className={cn(
              "flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-white/10 dark:bg-white/[0.02]",
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

Dialog.displayName = "Dialog";