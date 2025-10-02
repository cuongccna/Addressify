import React from "react";
import { cn } from "@/utils/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: "sm" | "md" | "lg";
  glass?: boolean;
};

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  className,
  children,
  padding = "md",
  glass = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-800",
        paddingMap[padding],
        glass ? "bg-slate-900/70" : "bg-slate-950/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
