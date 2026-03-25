import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FiEdit2, FiTrash2, FiDollarSign } from "react-icons/fi";
import type { Category } from "@/types/types";

interface SubcategoryCardProps {
  subcategory: Category;
  onEdit: () => void;
  onDelete: (id: number, name: string) => void;
  onPriceAdjustment: (category: Category) => void;
}

export function SubcategoryCard({
  subcategory,
  onEdit,
  onDelete,
  onPriceAdjustment,
}: SubcategoryCardProps) {
  return (
    <Card className="hover:shadow-xl transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl text-[#64748B]">└─</span>
            <h3 className="text-2xl font-bold text-[#0F172A]">
              {subcategory.name}
            </h3>
          </div>
          <p className="text-lg text-[#64748B] ml-9">ID: {subcategory.id}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="warning"
            size="md"
            onClick={() => onPriceAdjustment(subcategory)}
            className="flex items-center justify-center gap-2"
          >
            <FiDollarSign className="text-xl" />
            Ajustar precios
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onEdit}
            className="flex items-center justify-center gap-2"
          >
            <FiEdit2 className="text-xl" />
            Editar
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => onDelete(subcategory.id, subcategory.name)}
            className="flex items-center justify-center gap-2"
          >
            <FiTrash2 className="text-xl" />
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
}
