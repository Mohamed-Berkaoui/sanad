import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-900 text-white",
        secondary:
          "border-transparent bg-gray-100 text-gray-900",
        destructive:
          "border-transparent bg-red-100 text-red-700",
        outline: "text-gray-900 border-gray-300",
        // Priority variants
        critical:
          "border-transparent bg-red-100 text-red-700",
        urgent:
          "border-transparent bg-yellow-100 text-yellow-700",
        stable:
          "border-transparent bg-green-100 text-green-700",
        // Status variants
        pending:
          "border-transparent bg-gray-100 text-gray-700",
        acknowledged:
          "border-transparent bg-blue-100 text-blue-700",
        in_progress:
          "border-transparent bg-purple-100 text-purple-700",
        completed:
          "border-transparent bg-green-100 text-green-700",
        escalated:
          "border-transparent bg-red-100 text-red-700",
        cancelled:
          "border-transparent bg-gray-200 text-gray-500",
        // Case status variants
        open:
          "border-transparent bg-blue-100 text-blue-700",
        discharged:
          "border-transparent bg-green-100 text-green-700",
        admitted:
          "border-transparent bg-indigo-100 text-indigo-700",
        referred:
          "border-transparent bg-orange-100 text-orange-700",
        closed:
          "border-transparent bg-gray-100 text-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
