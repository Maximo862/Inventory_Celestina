import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiFolder } from "react-icons/fi";
import type { Category } from "@/types/types";

interface CategoryCardProps {
  category: Category;
  subcategoriesCount?: number;  // NUEVO
  onEdit: () => void;
  onDelete: (id: number, name: string) => void;
}

export function CategoryCard({
  category,
  subcategoriesCount = 0,  // NUEVO
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-xl transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
            {category.name}
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg text-[#475569]">ID: {category.id}</p>

            {/* Badge de subcategorías */}
            {subcategoriesCount > 0 && (
              <span className="inline-flex items-center gap-2 px-4 py-1 bg-[#16A34A]/10 border-2 border-[#16A34A]/30 rounded-lg text-base font-bold text-[#16A34A]">
                <FiFolder className="text-lg" />
                {subcategoriesCount} subcategoría{subcategoriesCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* NUEVO: Botón para ver subcategorías */}
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(`/categories/${category.id}/subcategories`)}
            className="flex items-center justify-center gap-2"
          >
            <FiFolder className="text-xl" />
            Subcategorías
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
            onClick={() => onDelete(category.id, category.name)}
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