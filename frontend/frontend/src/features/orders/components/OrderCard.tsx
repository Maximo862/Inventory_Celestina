import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FiEdit2, FiTrash2, FiEye, FiArrowDown, FiArrowUp, FiUser, FiMapPin } from "react-icons/fi";
import type { Order } from "@/types/types";
import { formatARS } from "@/utils/formatCurrency";

interface OrderCardProps {
  order: Order;
  clientName?: string;
  currentUserBranchId?: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: (id: number, type: string) => void;
}

export function OrderCard({
  order,
  clientName,
  currentUserBranchId,
  onView,
  onEdit,
  onDelete,
}: OrderCardProps) {
  const isEntry = order.type === "entry";
  const isProforma = order.document_type === "proforma";
  const date = new Date(order.created_at).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const orderBranchId = (order as any).branch_id;
  const canEdit = currentUserBranchId === undefined || currentUserBranchId === null || orderBranchId === currentUserBranchId;

  return (
    <Card className="hover:shadow-xl transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Información principal */}
        <div className="flex-1 space-y-3">
          {/* Header con tipo y fecha */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Badge de tipo de documento */}
            <span className={`inline-flex items-center gap-2 px-5 py-2 border-2 rounded-xl text-lg font-bold ${
              isProforma 
                ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]" 
                : "bg-[#4FA3D1]/10 border-[#4FA3D1]/30 text-[#4FA3D1]"
            }`}>
              {isProforma ? "Presupuesto" : "Remito"}
            </span>

            {/* Badge de operación */}
            {isEntry ? (
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-[#16A34A]/10 border-2 border-[#16A34A]/30 rounded-xl text-lg font-bold text-[#16A34A]">
                <FiArrowDown className="text-2xl" />
                Entrada
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-[#DC2626]/10 border-2 border-[#DC2626]/30 rounded-xl text-lg font-bold text-[#DC2626]">
                <FiArrowUp className="text-2xl" />
                Salida
              </span>
            )}

            {/* ID y fecha */}
            <div>
              <p className="text-base font-semibold text-[#64748B]">
                #{order.id}
              </p>
              <p className="text-base text-[#64748B]">{date}</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="space-y-2">
            {/* Sucursal */}
            {(order as any).branch_name && (
              <div className="flex items-center gap-2 text-lg">
                <FiMapPin className="text-[#64748B]" />
                <span className="font-semibold text-[#64748B]">Sucursal:</span>
                <span className="text-[#0F172A]">{(order as any).branch_name}</span>
                {(order as any).branch_address && (
                  <span className="text-[#64748B] text-sm">
                    - {(order as any).branch_address}
                  </span>
                )}
              </div>
            )}

            {/* Cliente */}
            {clientName && (
              <div className="flex items-center gap-2 text-lg">
                <FiUser className="text-[#64748B]" />
                <span className="font-semibold text-[#64748B]">Cliente:</span>
                <span className="text-[#0F172A]">{clientName}</span>
              </div>
            )}

            {/* Notas */}
            {order.notes && (
              <div className="text-lg">
                <span className="font-semibold text-[#64748B]">Notas: </span>
                <span className="text-[#0F172A]">{order.notes}</span>
              </div>
            )}

            {/* Monto total */}
            <div className="inline-block px-4 py-2 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-lg">
              <span className="text-base font-semibold text-[#64748B]">
                Total:{" "}
              </span>
              <span className="text-2xl font-bold text-[#0F172A]">
                {formatARS(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-56">
          <Button
            variant="secondary"
            size="md"
            onClick={onView}
            className="w-full flex items-center justify-center gap-2"
          >
            <FiEye className="text-xl" />
            Ver detalle
          </Button>

          {canEdit && (
            <>
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
                onClick={() =>
                  onDelete(order.id, isEntry ? "entrada" : "salida")
                }
                className="w-full flex items-center justify-center gap-2"
              >
                <FiTrash2 className="text-xl" />
                Eliminar
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}