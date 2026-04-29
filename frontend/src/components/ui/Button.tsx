import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-gold text-noir hover:bg-gold-light active:bg-gold-dark',
    outline: 'border border-gold text-gold hover:bg-gold hover:text-noir',
    ghost: 'text-white/70 hover:text-white hover:bg-white/5',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  const sizes = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm px-6 py-3',
    lg: 'text-sm px-10 py-4',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
