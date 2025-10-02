"use client";

import React from "react";
import { buttonVariants, ButtonVariant } from "./buttonVariants";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonVariants({ variant, className })}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { buttonVariants } from "./buttonVariants";
