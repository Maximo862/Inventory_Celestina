import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-bold rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white",
    success: "bg-[#16A34A] hover:bg-[#15803D] text-white",
    warning: "bg-[#F59E0B] hover:bg-[#D97706] text-white",
    danger: "bg-[#DC2626] hover:bg-[#B91C1C] text-white",
    secondary: "bg-white hover:bg-[#F8FAFC] text-[#0F172A] border-2 border-[#E2E8F0]",
  };

  const sizes = {
    sm: "px-4 py-2 text-base",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-5 text-xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
