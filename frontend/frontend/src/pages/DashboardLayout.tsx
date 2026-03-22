import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react"; // ← AGREGAR useContext
import { AuthContext } from "@/features/auth/context/AuthContext"; // ← NUEVO
import { useAuthActions } from "@/features/auth/hooks/useAuthActions";
import { Button } from "@/components/Button";
import { IoMdPerson, IoIosHome, IoMdClose } from "react-icons/io";
import { FaBox } from "react-icons/fa6";
import { GiTicket } from "react-icons/gi";
import { FiFileText } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";
import { FiAlignLeft } from "react-icons/fi";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { logout } = useAuthActions();
  const { user } = useContext(AuthContext)!; // ← NUEVO

  const isAdmin = user?.role === "admin"; // ← NUEVO

  // Definir items con roles requeridos
  const menuItems = [
    {
      path: "/home",
      label: "Inicio",
      icon: <IoIosHome />,
      roles: ["admin"], // ← NUEVO: Todos pueden ver
    },
    {
      path: "/orders",
      label: "Remitos",
      icon: <FiFileText />,
      roles: ["admin", "employee"], // ← NUEVO: Todos pueden ver
    },
    {
      path: "/products",
      label: "Productos",
      icon: <FaBox />,
      roles: ["admin", "employee"], // ← NUEVO: Todos pueden ver
    },
    {
      path: "/clients",
      label: "Clientes",
      icon: <IoMdPerson />,
      roles: ["admin", "employee"], // ← NUEVO: Todos pueden ver
    },
    {
      path: "/categories",
      label: "Categorías",
      icon: <GiTicket />,
      roles: ["admin"], // ← NUEVO: Solo admin
    },
  ];

  // Filtrar items según rol del usuario
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || "employee"),
  );

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-3 rounded-xl shadow-lg border-2 border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
        aria-label="Abrir menú"
      >
        {isSidebarOpen ? (
          <IoMdClose className="text-3xl" />
        ) : (
          <FiAlignLeft className="text-3xl" />
        )}
      </button>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 bg-white border-r-2 border-[#E2E8F0] shadow-lg flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="p-6 border-b-2 border-[#E2E8F0]">
          <Link
            to="/"
            className="flex items-center space-x-4"
            onClick={handleLinkClick}
          >
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">LaCelestina</h1>
              <p className="text-base text-[#475569]">Maderera</p>
            </div>
          </Link>
        </div>

        {/* Info del usuario con badge de rol */}
        {user && (
          <div className="px-6 py-4 border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
            <p className="text-base font-semibold text-[#0F172A] mb-1">
              {user.email}
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${isAdmin
                ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30"
                : "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30"
                }`}
            >
              {isAdmin ? "Administrador" : "Empleado"}
            </span>
          </div>
        )}

        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center space-x-4 px-6 py-4 rounded-xl transition-all duration-200 ${active
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
