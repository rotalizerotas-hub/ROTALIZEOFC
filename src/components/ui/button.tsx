import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const baseClasses = "btn"
    
    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary", 
      ghost: "btn-ghost",
      destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl",
    }
    
    const sizeClasses = {
      sm: "btn-sm",
      default: "",
      lg: "btn-lg",
    }

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }