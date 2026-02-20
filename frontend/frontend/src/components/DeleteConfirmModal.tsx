import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full">
        <div className="text-center">
          {/* Icono de advertencia grande */}
          <div className="text-8xl mb-6">⚠️</div>

          <h2 className="text-3xl font-bold text-[#0F172A] mb-4">{title}</h2>

          <p className="text-xl text-[#475569] mb-3">{message}</p>

          {/* Nombre del item en negrita */}
          <p className="text-2xl font-bold text-[#DC2626] mb-8">{itemName}</p>

          <p className="text-lg text-[#475569] mb-8">
            Esta acción no se puede deshacer
          </p>

          {/* Botones grandes y claros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1"
            >
              ❌ Cancelar
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? "Eliminando..." : "🗑️ Eliminar"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}