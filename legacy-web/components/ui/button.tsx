import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    // 3D effect and border for all buttons
    "border border-gray-300 shadow-md hover:shadow-xl active:shadow-sm",
    // Animated transform for 3D press
    "hover:-translate-y-1 active:translate-y-0.5 hover:scale-105 active:scale-95",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-600 hover:from-blue-600 hover:to-blue-800",
        destructive:
          "bg-gradient-to-br from-red-500 to-red-700 text-white border-red-600 hover:from-red-600 hover:to-red-800",
        outline:
          "bg-white text-blue-700 border-blue-500 hover:bg-blue-50 hover:text-blue-900",
        secondary:
          "bg-gradient-to-br from-purple-400 to-purple-600 text-white border-purple-500 hover:from-purple-500 hover:to-purple-700",
        ghost:
          "bg-transparent text-blue-700 border-transparent hover:bg-blue-50 hover:text-blue-900",
        link:
          "text-blue-600 underline underline-offset-4 hover:text-blue-800 hover:no-underline border-none bg-transparent shadow-none",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-base",
        icon: "size-10 rounded-lg",
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
