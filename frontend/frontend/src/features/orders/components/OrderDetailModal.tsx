import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { FiX, FiArrowDown, FiArrowUp, FiUser, FiPackage } from "react-icons/fi";
import type { OrderWithDetails } from "@/types/types";
import { formatARS } from "@/utils/formatCurrency";

interface OrderDetailModalProps {
  isOpen: boolean;
  order: OrderWithDetails | null;
  onClose: () => void;
}

export function OrderDetailModal({
  isOpen,
  order,
  onClose,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const isEntry = order.type === "entry";
  const date = new Date(order.created_at).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b-2 border-[#E2E8F0]">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                {isEntry ? (
                  <span className="inline-flex items-center gap-2 px-5 py-2 bg-[#16A34A]/10 border-2 border-[#16A34A]/30 rounded-xl text-xl font-bold text-[#16A34A]">
                    <FiArrowDown className="text-2xl" />
                    Entrada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-5 py-2 bg-[#DC2626]/10 border-2 border-[#DC2626]/30 rounded-xl text-xl font-bold text-[#DC2626]">
                    <FiArrowUp className="text-2xl" />
                    Salida
                  </span>
                )}
                <h2 className="text-3xl font-bold text-[#0F172A]">
                  Remito #{order.id}
                </h2>
              </div>
              <p className="text-lg text-[#475569]">{date}</p>
            </div>

            <button
              onClick={onClose}
              className="text-[#475569] hover:text-[#0F172A] transition-colors p-2"
              aria-label="Cerrar"
            >
              <FiX className="text-3xl" />
            </button>
          </div>

          {/* Información general */}
          <div className="space-y-4 mb-6">
            {order.client_name && (
              <div className="flex items-center gap-3 text-xl">
                <FiUser className="text-2xl text-[#475569]" />
                <span className="font-semibold text-[#475569]">Cliente:</span>
                <span className="text-[#0F172A]">{order.client_name}</span>
              </div>
            )}

            {order.notes && (
              <div className="p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-lg">
                <p className="text-base font-semibold text-[#475569] mb-2">
                  Notas
                </p>
                <p className="text-lg text-[#0F172A]">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Tabla de items */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FiPackage className="text-2xl text-[#475569]" />
              <h3 className="text-2xl font-bold text-[#0F172A]">
                Productos ({order.items.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-2 border-[#E2E8F0] rounded-lg overflow-hidden">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="text-left p-4 text-lg font-bold text-[#0F172A] border-b-2 border-[#E2E8F0]">
                      Producto
                    </th>
                    <th className="text-right p-4 text-lg font-bold text-[#0F172A] border-b-2 border-[#E2E8F0]">
                      Cantidad
                    </th>
                    <th className="text-right p-4 text-lg font-bold text-[#0F172A] border-b-2 border-[#E2E8F0]">
                      Precio Unit.
                    </th>
                    <th className="text-right p-4 text-lg font-bold text-[#0F172A] border-b-2 border-[#E2E8F0]">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                    >
                      <td className="p-4 text-lg text-[#0F172A] border-b border-[#E2E8F0]">
                        {item.product_name}
                      </td>
                      <td className="p-4 text-lg text-[#0F172A] text-right border-b border-[#E2E8F0]">
                        {item.quantity}
                      </td>
                      <td className="p-4 text-lg text-[#0F172A] text-right border-b border-[#E2E8F0]">
                        {formatARS(item.price)}
                      </td>
                      <td className="p-4 text-lg font-semibold text-[#0F172A] text-right border-b border-[#E2E8F0]">
                        {formatARS(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#2563EB]/5">
                  <tr>
                    <td
                      colSpan={3}
                      className="p-4 text-xl font-bold text-[#0F172A] text-right"
                    >
                      TOTAL:
                    </td>
                    <td className="p-4 text-2xl font-bold text-[#2563EB] text-right">
                      {formatARS(order.total_amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Botón cerrar */}
          <div className="flex justify-end">
            <Button variant="secondary" size="lg" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
