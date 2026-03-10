import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FiEdit2, FiTrash2 } from "react-icons/fi"; // ← AGREGAR
import type { Product } from "@/types/types";
import { formatARS } from "@/utils/formatCurrency";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  isAdmin: boolean; // ← AGREGAR
  onEdit: () => void;
  onDelete: (id: number, name: string) => void;
}

export function ProductCard({
  product,
  categoryName,
  isAdmin, // ← AGREGAR
  onEdit,
  onDelete,
}: ProductCardProps) {
  const isLowStock = product.quantity < 10;
  const isOutOfStock = product.quantity === 0;

  return (
    <Card className="hover:shadow-xl transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#0F172A] mb-3">
                {product.name}
              </h3>
              {categoryName && (
                <div className="inline-block px-5 py-3 bg-[#2563EB]/10 border-2 border-[#2563EB]/30 rounded-xl">
                  <span className="text-xl font-bold text-[#2563EB]">
                    🏷️ {categoryName}
                  </span>
                </div>
              )}
            </div>

            {isOutOfStock ? (
              <span className="px-4 py-2 bg-[#DC2626] text-white text-lg font-bold rounded-lg">
                SIN STOCK
              </span>
            ) : isLowStock ? (
              <span className="px-4 py-2 bg-[#F59E0B] text-white text-lg font-bold rounded-lg">
                ⚠️ BAJO STOCK
              </span>
            ) : (
              <span className="px-4 py-2 bg-[#16A34A] text-white text-lg font-bold rounded-lg">
                ✓ EN STOCK
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-lg text-[#475569] leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#F8FAFC] p-4 rounded-lg border-2 border-[#E2E8F0]">
              <p className="text-sm font-semibold text-[#475569] mb-1">
                Cantidad
              </p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {product.quantity}
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-lg border-2 border-[#E2E8F0]">
              <p className="text-sm font-semibold text-[#475569] mb-1">
                Precio unitario apoximado
              </p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {formatARS(product.price)}
              </p>
            </div>

          </div>
        </div>

        {/* ← CONDICIONAL: Solo mostrar botones si es admin */}
        {isAdmin && (
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
            <Button
              variant="primary"
              size="md"
              onClick={onEdit}
              className="w-full flex items-center justify-center gap-2"
            >
              <FiEdit2 className="text-xl" />
              Editar
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => onDelete(product.id, product.name)}
              className="w-full flex items-center justify-center gap-2"
            >
              <FiTrash2 className="text-xl" />
              Eliminar
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
