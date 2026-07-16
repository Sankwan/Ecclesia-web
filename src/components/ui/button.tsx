import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-semibold text-sm px-5 py-2.5 transition-colors disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-clay text-clay-ink hover:bg-clay-hover shadow-[var(--shadow-sm)]",
  secondary: "bg-surface text-ink border border-line hover:bg-surface-sunken",
  danger: "bg-emergency text-white hover:opacity-90",
  ghost: "bg-transparent text-ink-soft hover:bg-surface-sunken hover:text-ink px-3",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ variant = "primary", className, ...props }, ref) {
  return <button ref={ref} className={clsx(base, variants[variant], className)} {...props} />;
});
