"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { cn } from "../lib/utils/cn";

const audioPlayerVariants = cva(
  `
  relative flex items-center gap-3
  rounded-full border
  transition-shadow duration-200
  select-none overflow-hidden
  `,
  {
    variants: {
      variant: {
        default: `
          bg-white border-zinc-200/80
          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]
          hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.08)]
          dark:bg-zinc-900 dark:border-white/10
          dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.4)]
        `,
        elevated: `
          bg-white border-zinc-200/60
          shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.1)]
          hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),0_12px_28px_rgba(0,0,0,0.12)]
          dark:bg-zinc-900 dark:border-white/10
          dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),0_8px_24px_rgba(0,0,0,0.6)]
        `,
        ghost: `
          bg-zinc-50 border-zinc-100
          dark:bg-zinc-800/60 dark:border-white/10
        `,
      },
      size: {
        sm: "h-12 pl-1.5 pr-4 gap-2",
        md: "h-14 pl-2 pr-5 gap-3",
        lg: "h-16 pl-2.5 pr-6 gap-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

function formatTime(secs: number): string {
  if (!isFinite(secs) || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md" | "lg";
}

const iconButtonSizeMap = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-9 w-9",
} as const;

const iconSizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-[18px] w-[18px]",
} as const;

function IconButton({ label, size = "md", className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        "text-zinc-500 transition-colors duration-100",
        "hover:bg-zinc-100 hover:text-zinc-800",
        "dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-200",
        "disabled:opacity-40 disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40",
        iconButtonSizeMap[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface AudioPlayerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onTimeUpdate" | "onEnded">,
    VariantProps<typeof audioPlayerVariants> {
  /** Audio source URL */
  src: string;
  /** Track title shown above the seek bar */
  title?: string;
  /** Artist or subtitle shown below the title */
  subtitle?: string;
  /** Cover art image URL — renders as a rounded square on the left */
  imageSrc?: string;
  /** Alt text for the cover image */
  imageAlt?: string;
  /** Autoplay on mount */
  autoPlay?: boolean;
  /** Loop playback */
  loop?: boolean;
  /** Initial volume 0–1 */
  defaultVolume?: number;
  /** Number of seconds the ±skip buttons jump. Defaults to 2. */
  skipSeconds?: number;
  /** Hide the volume control */
  hideVolume?: boolean;
  /** Hide the ±skip buttons */
  hideSkip?: boolean;
  /** Explicit width — defaults to 100% of the container */
  width?: number | string;
  /** Called with the current time whenever it updates */
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  /** Called when playback ends */
  onEnded?: () => void;
}

export const AudioPlayer = React.forwardRef<HTMLDivElement, AudioPlayerProps>(
  (
    {
      src,
      title,
      subtitle,
      imageSrc,
      imageAlt = "",
      autoPlay = false,
      loop = false,
      defaultVolume = 0.8,
      skipSeconds = 2,
      hideVolume = false,
      hideSkip = false,
      variant,
      size = "md",
      width,
      className,
      style,
      onTimeUpdate,
      onEnded,
      ...props
    },
    ref
  ) => {
    const resolvedSize = size ?? "md";

    const audioRef = React.useRef<HTMLAudioElement>(null);
    const seekTrackRef = React.useRef<HTMLDivElement>(null);
    const volTrackRef = React.useRef<HTMLDivElement>(null);

    const [playing, setPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(defaultVolume);
    const [muted, setMuted] = React.useState(false);
    const [seekDragging, setSeekDragging] = React.useState(false);
    const [volDragging, setVolDragging] = React.useState(false);

    const lastX = React.useRef(0);
    const activePointerId = React.useRef<number | null>(null);

    React.useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.volume = clamp(defaultVolume, 0, 1);
      audio.loop = loop;

      const onLoaded = () => setDuration(audio.duration);
      const onTick = () => {
        setCurrentTime(audio.currentTime);
        onTimeUpdate?.(audio.currentTime, audio.duration);
      };
      const onPlay = () => setPlaying(true);
      const onPause = () => setPlaying(false);
      const onEnd = () => {
        setPlaying(false);
        onEnded?.();
      };

      audio.addEventListener("loadedmetadata", onLoaded);
      audio.addEventListener("timeupdate", onTick);
      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);
      audio.addEventListener("ended", onEnd);

      return () => {
        audio.removeEventListener("loadedmetadata", onLoaded);
        audio.removeEventListener("timeupdate", onTick);
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
        audio.removeEventListener("ended", onEnd);
      };
    }, [src, loop, defaultVolume, onTimeUpdate, onEnded]);

    function togglePlay() {
      const audio = audioRef.current;
      if (!audio) return;
      if (playing) {
        audio.pause();
      } else {
        audio.play();
      }
    }

    function skip(secs: number) {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = clamp(audio.currentTime + secs, 0, duration);
    }

    function applyVolume(v: number) {
      const next = clamp(v, 0, 1);
      setVolume(next);
      if (audioRef.current) audioRef.current.volume = next;
      if (next > 0) setMuted(false);
    }

    function toggleMute() {
      const audio = audioRef.current;
      if (!audio) return;
      const next = !muted;
      setMuted(next);
      audio.muted = next;
    }

    function ratioFromTrack(
      clientX: number,
      trackRef: React.RefObject<HTMLDivElement | null>
    ): number {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return 0;
      return clamp((clientX - rect.left) / rect.width, 0, 1);
    }

    function handleSeekPointerDown(e: React.PointerEvent<HTMLDivElement>) {
      e.preventDefault();
      activePointerId.current = e.pointerId;
      lastX.current = e.clientX;
      setSeekDragging(true);
      const ratio = ratioFromTrack(e.clientX, seekTrackRef);
      const next = ratio * duration;
      setCurrentTime(next);
      if (audioRef.current) audioRef.current.currentTime = next;
    }

    function handleVolPointerDown(e: React.PointerEvent<HTMLDivElement>) {
      e.preventDefault();
      activePointerId.current = e.pointerId;
      lastX.current = e.clientX;
      setVolDragging(true);
      const ratio = ratioFromTrack(e.clientX, volTrackRef);
      applyVolume(ratio);
    }

    React.useEffect(() => {
      if (!seekDragging && !volDragging) return;

      function onMove(e: PointerEvent) {
        if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return;

        if (seekDragging) {
          const ratio = ratioFromTrack(e.clientX, seekTrackRef);
          const next = ratio * duration;
          setCurrentTime(next);
          if (audioRef.current) audioRef.current.currentTime = next;
        }

        if (volDragging) {
          const ratio = ratioFromTrack(e.clientX, volTrackRef);
          applyVolume(ratio);
        }

        lastX.current = e.clientX;
      }

      function onUp(e: PointerEvent) {
        if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return;
        setSeekDragging(false);
        setVolDragging(false);
        activePointerId.current = null;
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
    }, [seekDragging, volDragging, duration]);

    function handleSeekKeyDown(e: React.KeyboardEvent) {
      const step = duration / 100;
      if (e.key === "ArrowRight") skip(step * 5);
      else if (e.key === "ArrowLeft") skip(-step * 5);
      else if (e.key === "Home") { if (audioRef.current) audioRef.current.currentTime = 0; }
      else if (e.key === "End") { if (audioRef.current) audioRef.current.currentTime = duration; }
      else return;
      e.preventDefault();
    }

    const seekRatio = duration > 0 ? currentTime / duration : 0;
    const volRatio = muted ? 0 : volume;

    const imageSizes = { sm: "h-9 w-9", md: "h-10 w-10", lg: "h-11 w-11" };
    const playSizes = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-10 w-10" };
    const playIconSizes = { sm: "h-4 w-4", md: "h-[18px] w-[18px]", lg: "h-5 w-5" };
    const textSizes = { sm: "text-[11px]", md: "text-xs", lg: "text-[13px]" };
    const timeSizes = { sm: "text-[10px]", md: "text-[11px]", lg: "text-xs" };

    return (
      <div
        ref={ref}
        className={cn(audioPlayerVariants({ variant, size }), className)}
        style={{ width: width ?? "100%", ...style }}
        {...props}
      >
        <audio
          ref={audioRef}
          src={src}
          autoPlay={autoPlay}
          loop={loop}
          preload="metadata"
          className="hidden"
        />

        {imageSrc && (
          <div
            className={cn(
              "shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800",
              imageSizes[resolvedSize]
            )}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {(title || subtitle) && (
            <div className="flex min-w-0 flex-col gap-0">
              {title && (
                <p
                  className={cn(
                    "font-medium leading-tight text-zinc-900 dark:text-zinc-50 truncate",
                    textSizes[resolvedSize]
                  )}
                >
                  {title}
                </p>
              )}
              {subtitle && (
                <p
                  className={cn(
                    "leading-tight text-zinc-400 dark:text-zinc-500 truncate",
                    timeSizes[resolvedSize]
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span
              className={cn("shrink-0 tabular-nums text-zinc-400 dark:text-zinc-500", timeSizes[resolvedSize])}
            >
              {formatTime(currentTime)}
            </span>

            <div
              ref={seekTrackRef}
              role="slider"
              aria-label="Seek"
              aria-valuenow={Math.round(currentTime)}
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              tabIndex={0}
              onPointerDown={handleSeekPointerDown}
              onKeyDown={handleSeekKeyDown}
              className={cn(
                "relative flex-1 rounded-full cursor-pointer group outline-none",
                "h-1 bg-zinc-200 dark:bg-white/10",
                "focus-visible:ring-2 focus-visible:ring-zinc-400/40"
              )}
              style={{ touchAction: "none" }}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-none"
                style={{ width: `${seekRatio * 100}%` }}
              />
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full",
                  "bg-zinc-900 dark:bg-zinc-100",
                  "opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100",
                  "transition-all duration-150",
                  seekDragging && "opacity-100 scale-100",
                  "h-3 w-3 shadow-sm"
                )}
                style={{ left: `${seekRatio * 100}%` }}
              />
            </div>

            <span
              className={cn("shrink-0 tabular-nums text-zinc-400 dark:text-zinc-500", timeSizes[resolvedSize])}
            >
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!hideSkip && (
            <IconButton
              label={`Back ${skipSeconds} seconds`}
              size={resolvedSize}
              onClick={() => skip(-skipSeconds)}
              disabled={duration === 0}
            >
              <SkipBack className={iconSizeMap[resolvedSize]} />
            </IconButton>
          )}

          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={togglePlay}
            disabled={duration === 0}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full",
              "bg-zinc-900 text-white",
              "dark:bg-zinc-100 dark:text-zinc-900",
              "hover:bg-zinc-700 dark:hover:bg-zinc-300",
              "transition-colors duration-100",
              "disabled:opacity-40 disabled:pointer-events-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 dark:focus-visible:ring-zinc-100/40",
              playSizes[resolvedSize]
            )}
          >
            {playing ? (
              <Pause className={cn(playIconSizes[resolvedSize], "fill-current stroke-none")} />
            ) : (
              <Play className={cn(playIconSizes[resolvedSize], "fill-current stroke-none translate-x-px")} />
            )}
          </button>

          {!hideSkip && (
            <IconButton
              label={`Forward ${skipSeconds} seconds`}
              size={resolvedSize}
              onClick={() => skip(skipSeconds)}
              disabled={duration === 0}
            >
              <SkipForward className={iconSizeMap[resolvedSize]} />
            </IconButton>
          )}

          {!hideVolume && (
            <div className="flex items-center gap-1.5">
              <IconButton
                label={muted ? "Unmute" : "Mute"}
                size={resolvedSize}
                onClick={toggleMute}
              >
                {muted || volume === 0 ? (
                  <VolumeX className={iconSizeMap[resolvedSize]} />
                ) : (
                  <Volume2 className={iconSizeMap[resolvedSize]} />
                )}
              </IconButton>

              <div
                ref={volTrackRef}
                role="slider"
                aria-label="Volume"
                aria-valuenow={Math.round(volRatio * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
                onPointerDown={handleVolPointerDown}
                className={cn(
                  "relative cursor-pointer rounded-full outline-none group",
                  "h-1 w-14 bg-zinc-200 dark:bg-white/10",
                  "focus-visible:ring-2 focus-visible:ring-zinc-400/40"
                )}
                style={{ touchAction: "none" }}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                  style={{ width: `${volRatio * 100}%` }}
                />
                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full",
                    "bg-zinc-900 dark:bg-zinc-100 h-2.5 w-2.5",
                    "opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100",
                    "transition-all duration-150",
                    volDragging && "opacity-100 scale-100"
                  )}
                  style={{ left: `${volRatio * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

AudioPlayer.displayName = "AudioPlayer";