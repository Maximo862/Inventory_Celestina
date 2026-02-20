import { useState, useEffect } from "react";
import { FormLayout } from "@/components/FormLayout";
import { Input } from "@/components/Input";
import { useCategories } from "@/features/categories/context/CategoryContext";
import type { Product, CreateProductDTO, UpdateProductDTO } from "@/types/types";

interface ProductFormModalProps {
  isOpen: boolean;
  product?: Product | null;
  onClose: () => void;
  onSubmit: (data: CreateProductDTO | UpdateProductDTO) => Promise<void>;
}

export function ProductFormModal({
  isOpen,
  product,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const { categories } = useCategories()!;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    price: "",
    category_id: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        quantity: product.quantity.toString(),
        price: product.price.toString(),
        category_id: product.category_id?.toString() || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        quantity: "",
        price: "",
        category_id: "",
      });
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const dataToSubmit: any = {
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id), // Ahora es obligatorio
      };

      if (formData.description.trim()) {
        dataToSubmit.description = formData.description.trim();
      }

      await onSubmit(dataToSubmit);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      quantity: "",
      price: "",
      category_id: "",
    });
    onClose();
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const isEdit = !!product;
  const isFormValid =
    !!(formData.name.trim() &&
    formData.quantity.trim() &&
    !isNaN(parseInt(formData.quantity)) &&
    parseInt(formData.quantity) >= 0 &&
    formData.price.trim() &&
    !isNaN(parseFloat(formData.price)) &&
    parseFloat(formData.price) > 0 &&
    formData.category_id.trim()); // Validación de categoría obligatoria

  return (
    <FormLayout
      title={isEdit ? "Editar producto" : "Nuevo producto"}
      description={
        isEdit
          ? `Modificar: ${product.name}`
          : "Registrar un nuevo producto en el inventario"
      }
      onClose={handleClose}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "💾 Guardar cambios" : "➕ Crear producto"}
      isSubmitting={isSubmitting}
      isValid={isFormValid}
    >
      {/* Campos obligatorios */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-[#0F172A] border-b-2 border-[#E2E8F0] pb-3">
          📋 Datos obligatorios
        </h3>

        <Input
          id="product-name"
          label="Nombre del producto *"
          type="text"
          placeholder="Ej: Tablón de pino 2x4"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          autoFocus
        />

        {/* Categoría ahora es obligatoria */}
        <div>
          <label
            htmlFor="product-category"
            className="block text-[#0F172A] text-lg font-semibold mb-2"
          >
            Categoría *
          </label>
          <select
            id="product-category"
            value={formData.category_id}
            onChange={(e) => handleChange("category_id", e.target.value)}
            required
            className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
          >
            <option value="">Seleccione una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="mt-2 text-[#F59E0B] text-base font-medium">
              ⚠️ Debe crear al menos una categoría primero
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            id="product-quantity"
            label="Cantidad en stock *"
            type="number"
            min="0"
            placeholder="Ej: 50"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            required
          />

          <Input
            id="product-price"
            label="Precio unitario ($) *"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Ej: 1500.00"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Campos opcionales */}
      <div className="space-y-6 pt-4">
        <h3 className="text-2xl font-bold text-[#475569] border-b-2 border-[#E2E8F0] pb-3">
          📝 Datos opcionales
        </h3>

        <div>
          <label
            htmlFor="product-description"
            className="block text-[#0F172A] text-lg font-semibold mb-2"
          >
            Descripción
          </label>
          <textarea
            id="product-description"
            rows={4}
            placeholder="Ej: Madera de primera calidad, tratada para exteriores"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200 resize-none"
          />
        </div>
      </div>
    </FormLayout>
  );
}