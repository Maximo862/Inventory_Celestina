import { useState, useEffect } from "react";
import { FormLayout } from "@/components/FormLayout";
import { Input } from "@/components/Input";
import type { Category } from "@/types/types";

interface SubcategoryFormModalProps {
  isOpen: boolean;
  subcategory?: Category | null;
  parentCategory: Category;
  onClose: () => void;
  onSubmit: (data: { name: string; parent_id: number }) => Promise<void>;
}

export function SubcategoryFormModal({
  isOpen,
  subcategory,
  parentCategory,
  onClose,
  onSubmit,
}: SubcategoryFormModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subcategory) {
      setName(subcategory.name);
    } else {
      setName("");
    }
  }, [subcategory, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        parent_id: parentCategory.id,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  if (!isOpen) return null;

  const isEdit = !!subcategory;

  return (
    <FormLayout
      title={isEdit ? "Editar subcategoría" : "Nueva subcategoría"}
      description={
        isEdit
          ? `Modificar: ${subcategory.name}`
          : `Crear subcategoría de: ${parentCategory.name}`
      }
      onClose={handleClose}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "💾 Guardar cambios" : "➕ Crear subcategoría"}
      isSubmitting={isSubmitting}
      isValid={name.trim().length > 0}
    >
      {/* Info de categoría padre (solo lectura) */}
      <div className="p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-lg mb-4">
        <p className="text-base font-semibold text-[#475569] mb-1">
          Categoría padre
        </p>
        <p className="text-xl font-bold text-[#2563EB]">
          🏷️ {parentCategory.name}
        </p>
      </div>

      <Input
        id="subcategory-name"
        label="Nombre de la subcategoría"
        type="text"
        placeholder="Ej: Quebracho 240"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
      />
    </FormLayout>
  );
}
