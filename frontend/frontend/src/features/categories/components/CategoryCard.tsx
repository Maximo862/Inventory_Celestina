import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import type { Category } from "@/types/types";

interface CategoryCardProps {
  category: Category;
  onEdit: () => void; // Cambio: ahora no recibe id, ejecuta directamente
  onDelete: (id: number, name: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <Card className="hover:shadow-xl transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
            {category.name}
          </h3>
          <p className="text-lg text-[#475569]">ID: {category.id}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" size="md" onClick={onEdit}>
            ✏️ Editar
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => onDelete(category.id, category.name)}
          >
            🗑️ Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
}