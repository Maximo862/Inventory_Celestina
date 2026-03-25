import type { ReactNode, FormHTMLAttributes } from "react";
import { Button } from "@/components/Button";
import { FaTimes } from "react-icons/fa";

interface FormLayoutProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  title: string;
  description?: string;
  onClose: () => void;
  isModal?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
  isValid?: boolean;
}

export function FormLayout({
  children,
  title,
  description,
  onClose,
  isModal = true,
  submitLabel = "Guardar",
  isSubmitting = false,
  isValid = true,
  className = "",
  ...props
}: FormLayoutProps) {
  const formContent = (
    <form
      className={`bg-white border-2 border-[#E2E8F0] rounded-2xl shadow-2xl ${className}`}
      {...props}
    >
      <div className="px-6 py-5 border-b-2 border-[#E2E8F0]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-1">{title}</h2>
            {description && (
              <p className="text-lg text-[#64748B] mt-2">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] transition-colors duration-200 p-2"
            aria-label="Cerrar"
          >
            <FaTimes className="w-8 h-8" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {children}
      </div>

      <div className="px-6 py-5 border-t-2 border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <FaTimes className="text-xl" /> Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || !isValid}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Guardando..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-2xl">{formContent}</div>
      </div>
    );
  }

  return <div className="w-full max-w-2xl mx-auto">{formContent}</div>;
}
