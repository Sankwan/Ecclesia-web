import { HTMLAttributes } from "react";
import clsx from "clsx";

export type ChipTone = "red" | "blue" | "green" | "gold" | "neutral";

// Soft tinted pill: colored dot + tinted background. Calm, not shouty.
const tones: Record<ChipTone, string> = {
  red: "bg-emergency-tint text-emergency",
  blue: "bg-scheduled-tint text-scheduled",
  green: "bg-verified-tint text-verified",
  gold: "bg-gold-tint text-gold",
  neutral: "bg-surface-sunken text-ink-soft",
};

const dot: Record<ChipTone, string> = {
  red: "bg-emergency",
  blue: "bg-scheduled",
  green: "bg-verified",
  gold: "bg-gold",
  neutral: "bg-ink-faint",
};

export function Chip({
  tone = "neutral",
  dotless = false,
  className,
  children,
  // `solid` kept for API compatibility with existing call sites; ignored.
  solid: _solid,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: ChipTone; solid?: boolean; dotless?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    >
      {!dotless && <span className={clsx("h-1.5 w-1.5 rounded-full", dot[tone])} />}
      {children}
    </span>
  );
}
