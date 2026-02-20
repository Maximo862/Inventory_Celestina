import { useState, useEffect } from "react";
import { FormLayout } from "@/components/FormLayout";
import { Input } from "@/components/Input";
import type { Category } from "@/types/types";

interface CategoryFormModalProps {
  isOpen: boolean;
  category?: Category | null;
  onClose: () => void;
  onSubmit: (data: { name: string }) => Promise<void>;
}

export function CategoryFormModal({
  isOpen,
  category,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName("");
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim() });
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

  const isEdit = !!category;

  return (
    <FormLayout
      title={isEdit ? "Editar categoría" : "Nueva categoría"}
      description={
        isEdit
          ? `Modificar: ${category.name}`
          : "Crear una nueva categoría de productos"
      }
      onClose={handleClose}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "💾 Guardar cambios" : "➕ Crear categoría"}
      isSubmitting={isSubmitting}
      isValid={name.trim().length > 0}
    >
      <Input
        id="category-name"
        label="Nombre de la categoría"
        type="text"
        placeholder="Ej: Maderas duras"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
      />
    </FormLayout>
  );
}