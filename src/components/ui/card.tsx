import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-3xl !border border-border/70 !shadow-none text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "!bg-card",
        elevated: "bg-card",
        glass:
          "bg-card/60 backdrop-blur-2xl border-border/40 shadow-[inset_0_1px_0_0_rgb(255,255,255,.12),0_4px_16px_0_rgb(0,0,0,.08)] hover:bg-card/70 hover:border-border/60",
        gradient:
          "gradient-primary text-primary-foreground border-0 shadow-[0_4px_20px_0_rgb(0,0,0,.18)]",
        outline:
          "bg-transparent border-2 hover:border-primary/60 hover:bg-primary/[.03] hover:shadow-[0_0_0_4px_hsl(var(--primary)/0.06)]",
        interactive:
          "bg-card shadow-[0_2px_8px_0_rgb(0,0,0,.08)] hover:shadow-[0_8px_24px_0_rgb(0,0,0,.13)] hover:-translate-y-1 cursor-pointer active:translate-y-0 active:shadow-[0_2px_6px_0_rgb(0,0,0,.08)]",
        stat:
          "bg-card shadow-[0_2px_8px_0_rgb(0,0,0,.07)] border-s-[3px] hover:shadow-[0_4px_16px_0_rgb(0,0,0,.10)] hover:-translate-y-0.5",
        glow:
          "bg-card border-primary/20 shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_4px_20px_0_hsl(var(--primary)/0.12)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.25),0_8px_32px_0_hsl(var(--primary)/0.20)] hover:-translate-y-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  accentColor?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, accentColor, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      style={{
        ...style,
        ...(variant === "stat" && accentColor
          ? { borderInlineStartColor: accentColor }
          : {}),
      }}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-3 lg:p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-semibold leading-none text-sm uppercase tracking-widest text-primary/80 flex items-center gap-2",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-3 lg:p-6 pt-0",
      !className?.includes("grid") && !className?.includes("space-y-") && "space-y-3",
      className
    )}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-3 lg:p-6 pt-0 border-t border-border/50 mt-2",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	cardVariants
};
