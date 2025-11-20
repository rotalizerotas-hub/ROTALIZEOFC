import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variantClasses = {
      primary: "text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
      secondary: "bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:-translate-y-0.5",
      ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800",
      destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
    }
    
    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      default: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    }

    const primaryStyle = variant === 'primary' ? {
      background: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
      boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)',
    } : {}

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        style={primaryStyle}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }