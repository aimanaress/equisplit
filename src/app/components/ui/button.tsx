import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:translate-y-[1px] active:translate-y-[2px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-4 border-[#3D2817] shadow-[4px_4px_0px_0px_#3D2817] hover:shadow-[2px_2px_0px_0px_#3D2817] active:shadow-none",
        destructive:
          "bg-destructive text-white border-4 border-[#3D2817] shadow-[4px_4px_0px_0px_#3D2817] hover:shadow-[2px_2px_0px_0px_#3D2817] active:shadow-none",
        outline:
          "border-4 border-[#3D2817] bg-card text-foreground shadow-[4px_4px_0px_0px_#3D2817] hover:shadow-[2px_2px_0px_0px_#3D2817] active:shadow-none hover:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground border-4 border-[#3D2817] shadow-[4px_4px_0px_0px_#3D2817] hover:shadow-[2px_2px_0px_0px_#3D2817] active:shadow-none",
        ghost:
          "hover:bg-accent hover:text-accent-foreground border-2 border-transparent hover:border-[#3D2817]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-lg px-7 has-[>svg]:px-5 text-base",
        icon: "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };