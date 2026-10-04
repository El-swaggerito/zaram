import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant =
  | "green"
  | "gold"
  | "outline-light"
  | "outline-dark";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit" | "reset";
};

const variants: Record<ButtonVariant, string> = {
  green:
    "bg-zaram-green-900 text-zaram-ivory hover:bg-zaram-green-800",

  gold:
    "bg-zaram-gold-500 text-zaram-green-950 hover:bg-zaram-gold-400",

  "outline-light":
    "border border-zaram-ivory/70 text-zaram-ivory hover:bg-zaram-ivory hover:text-zaram-green-950",

  "outline-dark":
    "border border-zaram-green-900 text-zaram-green-900 hover:bg-zaram-green-900 hover:text-zaram-ivory",
};

export default function Button({
  children,
  href,
  variant = "green",
  className = "",
  type = "button",
}: ButtonProps) {
  const styles = [
    "inline-flex min-h-11 items-center justify-center",
    "px-6 py-3",
    "text-xs font-semibold uppercase tracking-[0.12em]",
    "transition-colors duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-zaram-gold-500",
    "focus-visible:ring-offset-2",
    variants[variant],
    className,
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={styles}>
      {children}
    </button>
  );
}
