import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthActions } from "@/features/auth/hooks/useAuthActions";
import { Button } from "@/components/Button";
import { IoMdPerson, IoIosHome   } from "react-icons/io";
import { FaBox } from "react-icons/fa6";
import { GiTicket } from "react-icons/gi";
import { CiLogout } from "react-icons/ci";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { logout } = useAuthActions();

  const menuItems = [
    { path: "/", label: "Inicio", icon: <IoIosHome/> },
    { path: "/products", label: "Productos", icon: <IoMdPerson/> },
    { path: "/clients", label: "Clientes", icon: <FaBox/> },
    { path: "/categories", label: "Categorías", icon: <GiTicket/> },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Botón hamburguesa móvil */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-3 rounded-xl shadow-lg border-2 border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
        aria-label="Abrir menú"
      >
        {isSidebarOpen ? (
          <span className="text-3xl">✕</span>
        ) : (
          <span className="text-3xl">☰</span>
        )}
      </button>

      {/* Overlay oscuro en móvil */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 bg-white border-r-2 border-[#E2E8F0] shadow-lg flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo y título */}
        <div className="p-6 border-b-2 border-[#E2E8F0]">
          <Link
            to="/"
            className="flex items-center space-x-4"
            onClick={handleLinkClick}
          >
            <div className="w-16 h-16 bg-[#2563EB] rounded-2xl flex items-center justify-center text-4xl">
              🪵
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">LaCelestina</h1>
              <p className="text-base text-[#475569]">Maderera</p>
            </div>
          </Link>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center space-x-4 px-6 py-4 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-[#2563EB] text-white shadow-lg"
                    : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="text-xl font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Botón de cerrar sesión */}
        <div className="p-4 border-t-2 border-[#E2E8F0]">
          <Button
            variant="danger"
            size="lg"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3"
          >
             <CiLogout className="text-2xl" /> Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
