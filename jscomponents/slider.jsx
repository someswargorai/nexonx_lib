"use client";

import * as React from "react";
import { cn } from "../lib/utils/cn";

const defaultColors = {
  trackGradient: "linear-gradient(180deg, #1C1E24 0%, #0E0F12 100%)",
  channelBackground: "#1A1C22",
  fillGradient: "linear-gradient(90deg, #3D4B66 0%, #5B7FE0 60%, #7FB2FF 100%)",
  glowColor: "127,178,255",
  handleGradient: "linear-gradient(155deg, #4A4D57 0%, #232529 70%)",
  handleDotColor: "#7FB2FF",
  readoutBackground: "#1A1C22",
  readoutBorder: "#3A4254",
  readoutTextColor: "#9CC4FF",
  readoutSuffixColor: "#5B7FE0",
  pageBackground: "#0C0D10",
  labelColor: "#4A4D57",
};

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export const Slider = React.forwardRef(function Slider(
  {
    value,
    onChange,
    onChangeCommitted,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    trackWidth = 320,
    unit = "%",
    padDigits = 2,
    label = "Drag to adjust",
    showReadoutAlways = false,
    hideReadout = false,
    formatValue,
    colors,
    className,
    ariaLabel = "Slider",
  },
  ref,
) {
  const c = { ...defaultColors, ...colors };

  const [drag, setDrag] = React.useState(false);
  const [keyboardActive, setKeyboardActive] = React.useState(false);
  const trackRef = React.useRef(null);
  const pointerId = React.useRef(null);

  const range = max - min;
  const ratio = range === 0 ? 0 : (value - min) / range;
  const fillWidth = clamp(ratio, 0, 1) * trackWidth;

  const displayValue = formatValue
    ? formatValue(value)
    : padDigits > 0
    ? String(Math.round(value)).padStart(padDigits, "0")
    : String(Math.round(value));

  const setValueFromClientX = React.useCallback(
    (clientX) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, trackWidth);
      const nextRatio = trackWidth === 0 ? 0 : x / trackWidth;
      const raw = min + nextRatio * range;
      const stepped = Math.round(raw / step) * step;
      onChange(clamp(stepped, min, max));
    },
    [min, max, range, step, trackWidth, onChange],
  );

  // Pointer events cover mouse + touch in one implementation.
  const handlePointerDown = (e) => {
    if (disabled) return;
    e.preventDefault();
    pointerId.current = e.pointerId;
    setDrag(true);
    setValueFromClientX(e.clientX);
  };

  React.useEffect(() => {
    if (!drag) return;

    const handlePointerMove = (e) => {
      if (pointerId.current !== null && e.pointerId !== pointerId.current)
        return;
      setValueFromClientX(e.clientX);
    };

    const handlePointerUp = (e) => {
      if (pointerId.current !== null && e.pointerId !== pointerId.current)
        return;
      setDrag(false);
      pointerId.current = null;
      onChangeCommitted?.(value);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  
  }, [drag, setValueFromClientX, onChangeCommitted]);

  const handleKeyDown = (e) => {
    if (disabled) return;

    const big = step * 10;
    let next = null;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = value + step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = value - step;
        break;
      case "PageUp":
        next = value + big;
        break;
      case "PageDown":
        next = value - big;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      default:
        return;
    }

    e.preventDefault();
    setKeyboardActive(true);
    const clamped = clamp(next, min, max);
    onChange(clamped);
    onChangeCommitted?.(clamped);
  };

  const isActive = drag || keyboardActive;
  const shouldShowReadout = !hideReadout && (showReadoutAlways || isActive);

  return (
    <div
      ref={ref}
      className={cn("flex flex-col items-center select-none", className)}
    >
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        className={cn(
          "relative flex items-center rounded-full p-[3px]",
          disabled && "opacity-50",
        )}
        style={{
          width: trackWidth + 6,
          background: c.trackGradient,
          boxShadow:
            "inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(255,255,255,0.03)",
          touchAction: "none",
          cursor: disabled ? "not-allowed" : drag ? "grabbing" : "pointer",
        }}
      >
        {/* Floating readout */}
        {!hideReadout && (
          <div
            className="pointer-events-none absolute left-0 top-0 z-20 flex flex-col items-center"
            style={{
              transform: `translateX(${fillWidth}px) translateX(-50%) translateY(${
                isActive ? "-58px" : "-50px"
              }) scale(${isActive ? 1 : 0.85})`,
              opacity: shouldShowReadout ? 1 : 0,
              transition:
                "opacity 160ms ease, transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div
              className="flex items-baseline gap-1 rounded-lg px-3 py-1.5"
              style={{
                background: c.readoutBackground,
                border: `1px solid ${c.readoutBorder}`,
                boxShadow: `0 8px 20px -4px rgba(0,0,0,0.5), 0 0 18px -2px rgba(${c.glowColor},0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}
            >
              <span
                className="font-mono text-[20px] font-medium leading-none tabular-nums tracking-tight"
                style={{ color: c.readoutTextColor }}
              >
                {displayValue}
              </span>
              {unit && (
                <span
                  className="font-mono text-[11px] leading-none"
                  style={{ color: c.readoutSuffixColor }}
                >
                  {unit}
                </span>
              )}
            </div>
            <div
              className="h-[7px] w-[7px] rotate-45"
              style={{
                marginTop: -4,
                background: c.readoutBackground,
                borderRight: `1px solid ${c.readoutBorder}`,
                borderBottom: `1px solid ${c.readoutBorder}`,
              }}
            />
          </div>
        )}

        {/* Channel */}
        <div
          className="relative h-[10px] w-full overflow-hidden rounded-full"
          style={{
            background: c.channelBackground,
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.7)",
          }}
        >
          {/* Fill */}
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${fillWidth}px`,
              background: c.fillGradient,
              boxShadow: drag
                ? `0 0 14px 1px rgba(${c.glowColor},0.55), inset 0 1px 1px rgba(255,255,255,0.25)`
                : `0 0 6px 0 rgba(${c.glowColor},0.3), inset 0 1px 1px rgba(255,255,255,0.18)`,
              transition: drag
                ? "none"
                : "box-shadow 200ms ease, width 100ms ease",
            }}
          />
        </div>

        {/* Handle */}
        <div
          role="slider"
          aria-label={ariaLabel}
          aria-valuenow={Math.round(value)}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onBlur={() => setKeyboardActive(false)}
          className="absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full"
          style={{
            left: `${fillWidth}px`,
            transform: `translate(-50%, -50%) scale(${isActive ? 1.12 : 1})`,
            background: c.handleGradient,
            cursor: disabled ? "not-allowed" : drag ? "grabbing" : "grab",
            boxShadow: isActive
              ? `0 0 0 5px rgba(${c.glowColor},0.18), 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.4)`
              : "0 2px 6px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.4)",
            transition: drag
              ? "box-shadow 80ms ease, transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "box-shadow 200ms ease, transform 160ms ease",
            outline: "none",
          }}
        >
          <div
            className="h-[7px] w-[7px] rounded-full"
            style={{
              background: c.handleDotColor,
              boxShadow: isActive
                ? `0 0 6px 1px ${c.handleDotColor}`
                : `0 0 2px 0 rgba(${c.glowColor},0.5)`,
            }}
          />
        </div>
      </div>

      {label !== null && (
        <p
          className="mt-10 text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: c.labelColor }}
        >
          {label}
        </p>
      )}
    </div>
  );
});

Slider.displayName = "Slider";
