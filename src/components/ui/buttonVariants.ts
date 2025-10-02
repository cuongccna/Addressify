import { cn } from "@/utils/cn";

const variants = {
  primary:
    "bg-sky-500 text-white shadow-lg shadow-sky-500/40 hover:bg-sky-400",
  secondary:
    "border border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white",
  outline:
    "border border-white/20 text-white hover:border-white/40",
  white:
    "bg-white text-slate-900 shadow-xl shadow-white/40 hover:shadow-white/60",
};

export type ButtonVariant = keyof typeof variants;

export function buttonVariants({
  variant = "primary",
  className,
}: {
  variant?: ButtonVariant;
  className?: string;
}) {
  return cn(
    "rounded-lg px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400",
    variants[variant],
    className
  );
}
