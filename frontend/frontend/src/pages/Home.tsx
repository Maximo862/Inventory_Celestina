import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useProducts } from "@/features/products/context/ProductContext";
import { useClients } from "@/features/clients/context/ClientContext";
import { useCategories } from "@/features/categories/context/CategoryContext";
import { getOrderStatsRequest } from "@/features/orders/api/OrderRequests";
import { IoMdPerson } from "react-icons/io";
import { FaBox } from "react-icons/fa6";
import { GiTicket } from "react-icons/gi";
import { FiFileText, FiArrowDown, FiArrowUp, FiAlertTriangle } from "react-icons/fi";
import { formatARS } from "@/utils/formatCurrency";

export function Home() {
  const navigate = useNavigate();
  const { products, pagination: paginationProducts } = useProducts()!;
  const { pagination: paginationClients } = useClients()!;
  const { categories } = useCategories()!;

  // ← Estado para stats de orders
  const [orderStats, setOrderStats] = useState({
    total_orders: 0,
    total_entries: 0,
    total_exits: 0,
    total_entries_amount: 0,
    total_exits_amount: 0,
  });

  // ← Cargar stats al montar
  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await getOrderStatsRequest();
        setOrderStats(stats);
      } catch (error) {
        console.error("Error loading order stats:", error);
      }
    }
    loadStats();
  }, []);

  // Estadísticas de productos (client-side de la página actual)
  const lowStockProducts = products.filter((p) => p.quantity < 10).length;
  const outOfStockProducts = products.filter((p) => p.quantity === 0).length;

  const stats = [
    {
      label: "Productos",
      value: paginationProducts?.total || 0,
      icon: <FaBox />,
      color: "bg-[#2563EB]",
    },
    {
      label: "Clientes",
      value: paginationClients?.total || 0,
      icon: <IoMdPerson />,
      color: "bg-[#16A34A]",
    },
    {
      label: "Categorías",
      value: categories.length,
      icon: <GiTicket />,
      color: "bg-[#F59E0B]",
    },
    {
      label: "Remitos",
      value: orderStats.total_orders,
      icon: <FiFileText />,
      color: "bg-[#DC2626]",
    },
  ];

  const sections = [
    {
      title: "Productos",
      description: "Ver y administrar productos del inventario",
      path: "/products",
      icon: <FaBox />,
      badge: lowStockProducts > 0 ? `${lowStockProducts} bajo stock` : null,
    },
    {
      title: "Clientes",
      description: "Gestionar información de clientes",
      path: "/clients",
      icon: <IoMdPerson />,
    },
    {
      title: "Categorías",
      description: "Organizar productos por categorías",
      path: "/categories",
      icon: <GiTicket />,
    },
    {
      title: "Remitos",
      description: "Registrar entradas y salidas de productos",
      path: "/orders",
      icon: <FiFileText />,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventario LaCelestina"
        subtitle="Panel de control y gestión"
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Cards de Entradas y Salidas (desde backend stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card className="bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white">
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <FiArrowUp className="text-5xl" />
              <p className="text-2xl font-semibold opacity-90">
                Ganancia Total de Salidas
              </p>
            </div>
            <p className="text-5xl font-bold">
              {formatARS(orderStats.total_exits_amount)}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white">
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <FiArrowDown className="text-5xl" />
              <p className="text-2xl font-semibold opacity-90">
                Gasto Total en Entradas
              </p>
            </div>
            <p className="text-5xl font-bold">
              {formatARS(orderStats.total_entries_amount)}
            </p>
          </div>
        </Card>

      </div>

      {/* Alertas de inventario */}
      {(lowStockProducts > 0 || outOfStockProducts > 0) && (
        <Card className="bg-[#FEF2F2] border-2 border-[#DC2626]">
          <div className="flex items-start gap-4">
            <FiAlertTriangle className="text-5xl" />
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

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-3xl font-bold text-[#0F172A] mb-6">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section) => (
            <Card
              key={section.path}
              className="hover:shadow-xl transition-shadow flex flex-col"
            >
              <div className="text-center flex-1 flex flex-col">
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

                <p className="text-lg text-[#475569] mb-6 flex-1">
                  {section.description}
                </p>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(section.path)}
                  className="w-full mt-auto"
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
