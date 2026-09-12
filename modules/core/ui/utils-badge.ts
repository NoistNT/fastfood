import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-mono text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-primary/40 bg-primary/10 text-primary [a&]:hover:bg-primary/20 dark:border-primary/30 dark:bg-primary/[8%]',
        secondary: 'border-border/60 bg-muted/20 text-muted-foreground [a&]:hover:bg-muted/40',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        destructive:
          'border-destructive/40 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/20 dark:border-destructive/30 dark:bg-destructive/[8%]',
        success:
          'border-success/40 bg-success/10 text-success [a&]:hover:bg-success/20 dark:border-success/30 dark:bg-success/[8%]',
        warning:
          'border-warning/40 bg-warning/10 text-warning [a&]:hover:bg-warning/20 dark:border-warning/30 dark:bg-warning/[8%]',
        info: 'border-info/40 bg-info/10 text-info [a&]:hover:bg-info/20 dark:border-info/30 dark:bg-info/[8%]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
