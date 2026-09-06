import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-heading font-semibold tracking-wide whitespace-nowrap transition-all duration-250 outline-none select-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-dark border-transparent shadow-sm hover:bg-gold-dark hover:-translate-y-0.5 hover:shadow-md transition-all duration-250",
        outline:
          "border border-border bg-card text-foreground hover:border-gold hover:text-gold hover:bg-gold/10 hover:-translate-y-0.5 transition-all duration-250",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:border-gold hover:text-gold hover:bg-gold/10 hover:-translate-y-0.5 transition-all duration-250",
        ghost:
          "bg-transparent text-foreground/80 hover:bg-gold/10 hover:text-gold transition-all duration-200",
        "ghost-dark":
          "bg-transparent text-silver hover:bg-white/10 hover:text-white transition-all duration-200",
        destructive:
          "bg-red-600 text-white border-transparent shadow-sm hover:bg-red-700 hover:-translate-y-0.5 transition-all duration-250",
        link: "text-gold underline-offset-4 hover:underline bg-transparent p-0 h-auto",
      },
      size: {
        default: "h-11 gap-2 px-5",
        xs:      "h-7 gap-1 px-3 text-xs rounded-lg",
        sm:      "h-9 gap-1.5 px-4 text-xs rounded-xl",
        lg:      "h-12 gap-2 px-7 text-sm",
        xl:      "h-14 gap-2.5 px-9 text-base",
        icon:    "size-10 rounded-xl",
        "icon-xs": "size-7 rounded-lg",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
