import { useState, useEffect, useMemo } from "react";
import { FormLayout } from "@/components/FormLayout";
import { Button } from "@/components/Button";
import { useClients } from "@/features/clients/context/ClientContext";
import { useProducts } from "@/features/products/context/ProductContext";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import type { Order, CreateOrderDTO, UpdateOrderDTO } from "@/types/types";

interface OrderFormModalProps {
  isOpen: boolean;
  order?: Order | null;
  onClose: () => void;
  onSubmit: (data: CreateOrderDTO | UpdateOrderDTO) => Promise<void>;
}

interface OrderItemForm {
  product_id: string;
  quantity: string;
  price: string;
}

export function OrderFormModal({
  isOpen,
  order,
  onClose,
  onSubmit,
}: OrderFormModalProps) {
  const { clients } = useClients()!;
  const { products } = useProducts()!;

  const [type, setType] = useState<"entry" | "exit">("entry");
  const [clientId, setClientId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItemForm[]>([
    { product_id: "", quantity: "", price: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      // Modo edición (solo client_id y notes)
      setClientId(order.client_id?.toString() || "");
      setNotes(order.notes || "");
    } else {
      // Modo creación
      setType("entry");
      setClientId("");
      setNotes("");
      setItems([{ product_id: "", quantity: "", price: "" }]);
    }
  }, [order, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      if (order) {
        // Edición: solo client_id y notes
        const data: UpdateOrderDTO = {
          client_id: clientId ? parseInt(clientId) : null,
          notes: notes.trim() || undefined,
        };
        await onSubmit(data);
      } else {
        // Creación: orden completa
        const data: CreateOrderDTO = {
          type,
          client_id: clientId ? parseInt(clientId) : undefined,
          notes: notes.trim() || undefined,
          items: items.map((item) => ({
            product_id: parseInt(item.product_id),
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
          })),
        };
        await onSubmit(data);
      }
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setType("entry");
    setClientId("");
    setNotes("");
    setItems([{ product_id: "", quantity: "", price: "" }]);
    onClose();
  };

  const handleAddItem = () => {
    setItems([...items, { product_id: "", quantity: "", price: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItemForm,
    value: string,
  ) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Auto-completar precio cuando se selecciona un producto
    if (field === "product_id" && value) {
      const product = products.find((p) => p.id === parseInt(value));
      if (product) {
        newItems[index].price = product.price.toString();
      }
    }

    setItems(newItems);
  };

  const calculateTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + qty * price;
    }, 0);
  }, [items]);

  const isFormValid = order
    ? true // Edición siempre válida
    : type &&
      items.length > 0 &&
      items.every(
        (item) =>
          item.product_id &&
          parseFloat(item.quantity) > 0 &&
          parseFloat(item.price) > 0,
      );

  if (!isOpen) return null;

  const isEdit = !!order;

  return (
    <FormLayout
      title={isEdit ? "Editar remito" : "Nuevo remito"}
      description={
        isEdit
          ? `Modificar remito #${order.id}`
          : "Registrar entrada o salida de productos"
      }
      onClose={handleClose}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "💾 Guardar cambios" : "➕ Registrar remito"}
      isSubmitting={isSubmitting}
      isValid={isFormValid}
    >
      <div className="space-y-6">
        {/* Tipo de orden (solo en creación) */}
        {!isEdit && (
          <div>
            <label className="block text-[#0F172A] text-lg font-semibold mb-3">
              Tipo de remito *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType("entry")}
                className={`p-4 rounded-xl border-2 text-lg font-bold transition-all ${
                  type === "entry"
                    ? "bg-[#16A34A]/10 border-[#16A34A] text-[#16A34A]"
                    : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
                }`}
              >
                📥 Entrada
              </button>
              <button
                type="button"
                onClick={() => setType("exit")}
                className={`p-4 rounded-xl border-2 text-lg font-bold transition-all ${
                  type === "exit"
                    ? "bg-[#DC2626]/10 border-[#DC2626] text-[#DC2626]"
                    : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
                }`}
              >
                📤 Salida
              </button>
            </div>
          </div>
        )}

        {/* Cliente (opcional) */}
        <div>
          <label
            htmlFor="client"
            className="block text-[#0F172A] text-lg font-semibold mb-2"
          >
            Cliente (opcional)
          </label>
          <select
            id="client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
          >
            <option value="">Sin cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notas */}
        <div>
          <label
            htmlFor="notes"
            className="block text-[#0F172A] text-lg font-semibold mb-2"
          >
            Notas / Observaciones
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Ej: Entrega para obra X"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200 resize-none"
          />
        </div>

        {/* Items (solo en creación) */}
        {!isEdit && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-[#0F172A]">Productos *</h3>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAddItem}
                className="flex items-center gap-2"
              >
                <FiPlus className="text-xl" />
                Agregar producto
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-lg"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Producto */}
                    <div className="sm:col-span-5">
                      <label className="block text-[#0F172A] text-base font-semibold mb-2">
                        Producto
                      </label>
                      <select
                        value={item.product_id}
                        onChange={(e) =>
                          handleItemChange(index, "product_id", e.target.value)
                        }
                        required
                        className="w-full bg-white text-[#0F172A] text-base rounded-lg p-3 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition duration-200"
                      >
                        <option value="">Seleccionar</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (Stock: {product.quantity})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div className="sm:col-span-3">
                      <label className="block text-[#0F172A] text-base font-semibold mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        required
                        className="w-full bg-white text-[#0F172A] text-base rounded-lg p-3 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition duration-200"
                      />
                    </div>

                    {/* Precio */}
                    <div className="sm:col-span-3">
                      <label className="block text-[#0F172A] text-base font-semibold mb-2">
                        Precio Unitario
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(index, "price", e.target.value)
                        }
                        required
                        className="w-full bg-white text-[#0F172A] text-base rounded-lg p-3 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition duration-200"
                      />
                    </div>

                    {/* Botón eliminar */}
                    <div className="sm:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="w-full p-3 text-[#DC2626] hover:bg-[#DC2626]/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Eliminar producto"
                      >
                        <FiTrash2 className="text-xl mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  {item.quantity && item.price && (
                    <div className="mt-3 text-right">
                      <span className="text-base font-semibold text-[#475569]">
                        Subtotal:{" "}
                      </span>
                      <span className="text-xl font-bold text-[#0F172A]">
                        $
                        {(
                          parseFloat(item.quantity) * parseFloat(item.price)
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            {items.length > 0 && (
              <div className="mt-6 p-4 bg-[#2563EB]/5 border-2 border-[#2563EB]/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#0F172A]">
                    TOTAL:
                  </span>
                  <span className="text-3xl font-bold text-[#2563EB]">
                    ${calculateTotal}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </FormLayout>
  );
}
