import { avatarTint, initials } from "@/lib/images";
import clsx from "clsx";

export function Avatar({ name, size = 44, className }: { name: string; size?: number; className?: string }) {
  const tint = avatarTint(name);
  return (
    <span
      className={clsx("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", className)}
      style={{
        width: size,
        height: size,
        background: tint.bg,
        color: tint.fg,
        fontSize: size * 0.4,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
