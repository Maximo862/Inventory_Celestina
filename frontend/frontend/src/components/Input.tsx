import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-[#0F172A] text-lg font-semibold mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 ${
            error ? "border-[#DC2626]" : "border-[#E2E8F0]"
          } focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200 ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-[#DC2626] text-base font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";