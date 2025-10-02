import React from "react";
import { cn } from "@/utils/cn";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  centered = true,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "text-center" : "text-left",
        className
      )}
    >
      <h2 className="text-3xl font-semibold tracking-tight text-slate-50">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-base text-slate-300">{subtitle}</p>
      ) : null}
    </div>
  );
}
