"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { Eye, EyeOff, X, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils/cn";

const inputWrapperVariants = cva(
  `
  relative flex w-full items-center
  rounded-lg border bg-white
  transition-all duration-150 ease-out
  focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-white
  dark:bg-zinc-900 dark:focus-within:ring-offset-zinc-950
`,
  {
    variants: {
      state: {
        default: `
          border-zinc-200 focus-within:border-zinc-400 focus-within:ring-zinc-400/30
          dark:border-white/10 dark:focus-within:border-white/25 dark:focus-within:ring-white/15
        `,
        error: `
          border-red-300 focus-within:border-red-400 focus-within:ring-red-400/30
          dark:border-red-500/40 dark:focus-within:border-red-500/60 dark:focus-within:ring-red-500/20
        `,
        success: `
          border-emerald-300 focus-within:border-emerald-400 focus-within:ring-emerald-400/30
          dark:border-emerald-500/40 dark:focus-within:border-emerald-500/60 dark:focus-within:ring-emerald-500/20
        `,
      },
      size: {
        sm: "h-9 gap-1.5 px-3 text-sm",
        md: "h-10 gap-2 px-3.5 text-sm",
        lg: "h-12 gap-2 px-4 text-base",
      },
      disabled: {
        true: "cursor-not-allowed opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      state: "default",
      size: "md",
      disabled: false,
    },
  },
);

const iconSizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-[18px] w-[18px]",
};

let inputIdCounter = 0;

/**
 * @typedef {Object} InputProps
 * @property {string} [label]
 * @property {string} [helperText]
 * @property {string} [errorText]
 * @property {boolean} [success]
 * @property {"default"|"error"|"success"} [state]
 * @property {"sm"|"md"|"lg"} [size]
 * @property {React.ReactNode} [leadingIcon]
 * @property {React.ReactNode} [trailingIcon]
 * @property {boolean} [clearable]
 * @property {boolean} [passwordToggle]
 * @property {string} [containerClassName]
 * @property {string} [labelClassName]
 */

/**
 * Production-grade Input component with label, helper/error text,
 * icon slots, password toggle, and a clear button.
 *
 * @type {React.ForwardRefExoticComponent<InputProps & React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>}
 */
export const Input = React.forwardRef(function Input(
  {
    className,
    containerClassName,
    labelClassName,
    size = "md",
    state,
    label,
    helperText,
    errorText,
    success = false,
    leadingIcon,
    trailingIcon,
    clearable = false,
    passwordToggle = false,
    disabled,
    type = "text",
    id,
    value,
    defaultValue,
    onChange,
    ...props
  },
  ref,
) {
  const resolvedSize = size ?? "md";
  const generatedId = React.useId
    ? React.useId()
    : React.useMemo(() => `nx-input-${++inputIdCounter}`, []);
  const inputId = id ?? generatedId;

  const [showPassword, setShowPassword] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const hasValue =
    currentValue !== undefined && currentValue !== null && currentValue !== "";

  const resolvedState = errorText
    ? "error"
    : success
    ? "success"
    : state ?? "default";
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  const innerRef = React.useRef(null);
  React.useImperativeHandle(ref, () => innerRef.current);

  function handleChange(e) {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  }

  function handleClear() {
    const input = innerRef.current;
    if (!input) return;

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    nativeSetter?.call(input, "");

    const event = new Event("input", { bubbles: true });
    input.dispatchEvent(event);

    if (!isControlled) setInternalValue("");
    input.focus();
  }

  const showClearButton = clearable && hasValue && !disabled;
  const showPasswordToggle = passwordToggle && isPassword && !disabled;
  const hasTrailingControls =
    showClearButton || showPasswordToggle || trailingIcon;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "text-sm font-medium text-zinc-700 dark:text-zinc-300",
            disabled && "opacity-50",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          inputWrapperVariants({
            state: resolvedState,
            size,
            disabled: !!disabled,
          }),
          className,
        )}
      >
        {leadingIcon && (
          <span
            className={cn(
              "flex shrink-0 items-center text-zinc-400 dark:text-zinc-500",
              iconSizeMap[resolvedSize],
            )}
          >
            {leadingIcon}
          </span>
        )}

        <input
          ref={innerRef}
          id={inputId}
          type={resolvedType}
          disabled={disabled}
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          aria-invalid={resolvedState === "error" || undefined}
          aria-describedby={
            errorText
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={cn(
            "h-full w-full min-w-0 flex-1 bg-transparent",
            "text-zinc-900 placeholder:text-zinc-400",
            "dark:text-zinc-50 dark:placeholder:text-zinc-500",
            "outline-none disabled:cursor-not-allowed",
          )}
          {...props}
        />

        {hasTrailingControls && (
          <span className="flex shrink-0 items-center gap-1.5">
            {showClearButton && (
              <button
                type="button"
                tabIndex={-1}
                onClick={handleClear}
                aria-label="Clear input"
                className={cn(
                  "flex items-center justify-center rounded-full p-0.5",
                  "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100",
                  "dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/10",
                  "transition-colors duration-100",
                )}
              >
                <X className={iconSizeMap[resolvedSize]} />
              </button>
            )}

            {showPasswordToggle && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className={cn(
                  "flex items-center justify-center rounded-full p-0.5",
                  "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100",
                  "dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/10",
                  "transition-colors duration-100",
                )}
              >
                {showPassword ? (
                  <EyeOff className={iconSizeMap[resolvedSize]} />
                ) : (
                  <Eye className={iconSizeMap[resolvedSize]} />
                )}
              </button>
            )}

            {!showPasswordToggle && !showClearButton && trailingIcon && (
              <span
                className={cn(
                  "flex items-center text-zinc-400 dark:text-zinc-500",
                  iconSizeMap[resolvedSize],
                )}
              >
                {trailingIcon}
              </span>
            )}
          </span>
        )}

        {resolvedState === "error" && !hasTrailingControls && (
          <AlertCircle
            className={cn("shrink-0 text-red-500", iconSizeMap[resolvedSize])}
          />
        )}
      </div>

      {errorText ? (
        <p
          id={`${inputId}-error`}
          className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400"
        >
          {errorText}
        </p>
      ) : helperText ? (
        <p
          id={`${inputId}-helper`}
          className="text-xs text-zinc-500 dark:text-zinc-400"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = "Input";
