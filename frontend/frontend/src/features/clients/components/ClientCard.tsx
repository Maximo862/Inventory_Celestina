import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import type { Client } from "@/types/types";

interface ClientCardProps {
  client: Client;
  onEdit: () => void; // Cambio: ahora ejecuta directamente
  onDelete: (id: number, name: string) => void;
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <Card className="hover:shadow-xl transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1 space-y-3">
          <h3 className="text-2xl font-bold text-[#0F172A]">{client.name}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-lg">
            <div>
              <span className="font-semibold text-[#475569]">CUIL: </span>
              <span className="text-[#0F172A]">{client.cuil}</span>
            </div>

            <div>
              <span className="font-semibold text-[#475569]">Condición: </span>
              <span className="text-[#0F172A]">{client.tax_condition}</span>
            </div>

            {client.phone && (
              <div>
                <span className="font-semibold text-[#475569]">Teléfono: </span>
                <span className="text-[#0F172A]">{client.phone}</span>
              </div>
            )}

            {client.email && (
              <div>
                <span className="font-semibold text-[#475569]">Email: </span>
                <span className="text-[#0F172A]">{client.email}</span>
              </div>
            )}
          </div>

          {client.address && (
            <div className="text-lg">
              <span className="font-semibold text-[#475569]">Dirección: </span>
              <span className="text-[#0F172A]">{client.address}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
          <Button
            variant="primary"
            size="md"
            onClick={onEdit}
            className="w-full"
          >
            ✏️ Editar
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => onDelete(client.id, client.name)}
            className="w-full"
          >
            🗑️ Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
}