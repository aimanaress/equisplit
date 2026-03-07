import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-[#3D2817] flex h-11 w-full min-w-0 rounded-lg border-3 px-4 py-2 text-base bg-[#FDFCFA] transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-semibold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] font-medium",
        "focus-visible:border-[#F48B5C] focus-visible:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),0_0_0_3px_rgba(244,139,92,0.2)]",
        "aria-invalid:border-[#E63946]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };