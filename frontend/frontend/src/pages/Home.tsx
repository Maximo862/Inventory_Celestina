import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useProducts } from "@/features/products/context/ProductContext";
import { useClients } from "@/features/clients/context/ClientContext";
import { useCategories } from "@/features/categories/context/CategoryContext";
import { IoMdPerson } from "react-icons/io";
import { FaBox } from "react-icons/fa6";
import { GiTicket } from "react-icons/gi";

export function Home() {
  const navigate = useNavigate();
  const { products } = useProducts()!;
  const { clients } = useClients()!;
  const { categories } = useCategories()!;

  // Estadísticas
  const lowStockProducts = products.filter((p) => p.quantity < 10).length;
  const outOfStockProducts = products.filter((p) => p.quantity === 0).length;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.quantity * p.price,
    0
  );

  const stats = [
    {
      label: "Productos",
      value: products.length,
      icon: <FaBox/>,
      color: "bg-[#2563EB]",
    },
    {
      label: "Clientes",
      value: clients.length,
      icon: <IoMdPerson/>,
      color: "bg-[#16A34A]",
    },
    {
      label: "Categorías",
      value: categories.length,
      icon: <GiTicket/>,
      color: "bg-[#F59E0B]",
    },
  ];

  const sections = [
    {
      title: "Productos",
      description: "Ver y administrar productos del inventario",
      path: "/products",
      icon: <FaBox/>,
      badge: lowStockProducts > 0 ? `${lowStockProducts} bajo stock` : null,
    },
    {
      title: "Clientes",
      description: "Gestionar información de clientes",
      path: "/clients",
      icon: <IoMdPerson/>,
    },
    {
      title: "Categorías",
      description: "Organizar productos por categorías",
      path: "/categories",
      icon: <GiTicket/>,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventario LaCelestina"
        subtitle="Panel de control y gestión"
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <div
  className={`w-20 h-20 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
>
  <span className="text-white text-4xl flex items-center justify-center">
    {stat.icon}
  </span>
</div>

            <p className="text-5xl font-bold text-[#0F172A] mb-2">
              {stat.value}
            </p>
            <p className="text-xl font-semibold text-[#475569]">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Alertas de inventario */}
      {(lowStockProducts > 0 || outOfStockProducts > 0) && (
        <Card className="bg-[#FEF2F2] border-2 border-[#DC2626]">
          <div className="flex items-start gap-4">
            <div className="text-5xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#DC2626] mb-2">
                Alertas de inventario
              </h3>
              <div className="space-y-2 text-lg text-[#991B1B]">
                {outOfStockProducts > 0 && (
                  <p className="font-semibold">
                    • {outOfStockProducts} productos sin stock
                  </p>
                )}
                {lowStockProducts > 0 && (
                  <p className="font-semibold">
                    • {lowStockProducts} productos con bajo stock
                  </p>
                )}
              </div>
              <Button
                variant="danger"
                size="md"
                onClick={() => navigate("/products")}
                className="mt-4"
              >
                Ver productos
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Valor total del inventario */}
      <Card className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white">
        <div className="text-center py-4">
          <p className="text-xl font-semibold mb-2 opacity-90">
            Valor total del inventario
          </p>
          <p className="text-5xl font-bold">
            ${totalInventoryValue}
          </p>
        </div>
      </Card>

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-3xl font-bold text-[#0F172A] mb-6">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Card
              key={section.path}
              className="hover:shadow-xl transition-shadow"
            >
              <div className="text-center">
                <div className="mb-4 flex justify-center">
  <span className="text-6xl flex items-center justify-center">
    {section.icon}
  </span>
</div>

                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">
                  {section.title}
                </h3>
                {section.badge && (
                  <span className="inline-block px-4 py-2 bg-[#F59E0B] text-white text-base font-bold rounded-lg mb-4">
                    {section.badge}
                  </span>
                )}
                <p className="text-lg text-[#475569] mb-6">
                  {section.description}
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(section.path)}
                  className="w-full"
                >
                  Ir a {section.title}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}