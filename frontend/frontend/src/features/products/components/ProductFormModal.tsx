import { useState, useEffect, useMemo } from "react";
import { FormLayout } from "@/components/FormLayout";
import { Input } from "@/components/Input";
import { useCategories } from "@/features/categories/context/CategoryContext";
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
} from "@/types/types";
import { parsePrice } from "@/utils/parsePrice";
import { FaClipboardList, FaLightbulb, FaTriangleExclamation } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

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

  const [selectedParentId, setSelectedParentId] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSubcategories = useMemo(() => {
    if (!selectedParentId) return [];
    return categories.filter(
      (cat) => cat.parent_id === Number(selectedParentId),
    );
  }, [categories, selectedParentId]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        quantity: product.quantity.toString(),
        price: String(Number(product.price)),
        category_id: product.category_id?.toString() || "",
      });

      if (product.category_id) {
        const category = categories.find(
          (cat) => cat.id === product.category_id,
        );
        if (category?.parent_id) {
          setSelectedParentId(category.parent_id.toString());
        } else if (category) {
          setSelectedParentId(category.id.toString());
        }
      }
    } else {
      setFormData({
        name: "",
        description: "",
        quantity: "",
        price: "",
        category_id: "",
      });
      setSelectedParentId("");
    }
  }, [product, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const dataToSubmit: any = {
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity),
        price: parsePrice(formData.price),
        category_id: parseInt(formData.category_id),
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
    let sanitized = value;

    if (field === "price") {
      sanitized = value.replace(/\D/g, "");
    }
    setFormData((prev) => ({ ...prev, [field]: sanitized }));
  };

  const handleParentChange = (value: string) => {
    setSelectedParentId(value);

    const hasSubcategories = categories.some(
      (cat) => cat.parent_id === Number(value),
    );

    if (hasSubcategories) {
      setFormData((prev) => ({ ...prev, category_id: "" }));
    } else {
      setFormData((prev) => ({ ...prev, category_id: value }));
    }
  };

  if (!isOpen) return null;

  const isEdit = !!product;
  const isFormValid = !!(
    formData.name.trim() &&
    formData.quantity.trim() &&
    !isNaN(parseInt(formData.quantity)) &&
    parseInt(formData.quantity) >= 0 &&
    formData.price.trim() &&
    !isNaN(parseFloat(formData.price)) &&
    parseFloat(formData.price) > 0 &&
    formData.category_id.trim()
  );

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
      submitLabel={isEdit ? "Guardar cambios" : "Crear producto"}
      isSubmitting={isSubmitting}
      isValid={isFormValid}
    >
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-[#0F172A] border-b-2 border-[#E2E8F0] pb-3 flex items-center gap-2">
          <FaClipboardList className="text-xl" /> Datos obligatorios
        </h3>

        <Input
          id="product-name"
          label="Nombre del producto *"
          type="text"
          placeholder="Ej: Tablon de pino 2x4"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          autoFocus
        />

        <div className="space-y-4">
          <div>
            <label
              htmlFor="parent-category"
              className="block text-[#0F172A] text-lg font-semibold mb-2"
            >
              Categoria principal *
            </label>
            <select
              id="parent-category"
              value={selectedParentId}
              onChange={(e) => handleParentChange(e.target.value)}
              required
              className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200"
            >
              <option value="">Seleccione una categoria</option>
              {categories
                .filter((cat) => cat.parent_id === null)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {selectedParentId && availableSubcategories.length > 0 && (
            <div>
              <label
                htmlFor="product-category"
                className="block text-[#0F172A] text-lg font-semibold mb-2"
              >
                Subcategoria *
              </label>
              <select
                id="product-category"
                value={formData.category_id}
                onChange={(e) => handleChange("category_id", e.target.value)}
                required
                className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200"
              >
                <option value="">Seleccione una subcategoria</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-base text-[#64748B] flex items-center gap-2">
                <FaLightbulb className="text-base" /> Esta categoria tiene subcategorias. Debe elegir una.
              </p>
            </div>
          )}

          {categories.length === 0 && (
            <p className="mt-2 text-[#F59E0B] text-base font-medium flex items-center gap-2">
              <FaTriangleExclamation className="text-base" /> Debe crear al menos una categoria primero
            </p>
          )}
        </div>

        <div
          className={`grid grid-cols-1 ${isEdit ? "sm:grid-cols-1" : "sm:grid-cols-2"} gap-6`}
        >
          {!isEdit && (
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
          )}

          <Input
            id="product-price"
            label="Precio unitario apoximado($) *"
            type="text"
            placeholder="Ej: 1.500 o 1500,50"
            value={formData.price}
            onChange={(e) => {
              handleChange("price", e.target.value);
            }}
            required
          />
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h3 className="text-2xl font-bold text-[#64748B] border-b-2 border-[#E2E8F0] pb-3 flex items-center gap-2">
          <FaEdit className="text-xl" /> Datos opcionales
        </h3>

        <div>
          <label
            htmlFor="product-description"
            className="block text-[#0F172A] text-lg font-semibold mb-2"
          >
            Descripcion
          </label>
          <textarea
            id="product-description"
            rows={4}
            placeholder="Ej: Madera de primera calidad, tratada para exteriores"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200 resize-none"
          />
        </div>
      </div>
    </FormLayout>
  );
}
