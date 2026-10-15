import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function Button({
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all",
        className
      )}
      {...props}
    />
  );
}

export { Button };