import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({
  className,
  interactive,
  padded = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean; padded?: boolean }) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-card)]",
        padded && "p-5",
        interactive && "card-lift cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}
