import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./features/auth/pages/Login";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { Home } from "./pages/Home";
import { DashboardLayout } from "./pages/DashboardLayout";
import { CategoriesPage } from "./features/categories/pages/CategoriesPage";
import { Toaster } from "react-hot-toast";
import { ClientsPage } from "./features/clients/pages/ClientsPage";
import { ProductsPage } from "./features/products/pages/ProductsPage";
import { SubcategoriesPage } from "./features/categories/pages/SubcategoriesPage";
import { OrdersPage } from "./features/orders/pages/OrdersPage";
import { ProtectedRoutesRole } from "./ProtectedRoutesRole";
import { Register } from "./features/auth/pages/Register";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoutes />}>
            <Route element={<DashboardLayout />}>
              <Route element={<ProtectedRoutesRole />}>
                <Route path="/home" element={<Home />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route
                  path="/categories/:categoryId/subcategories"
                  element={<SubcategoriesPage />}
                />
              </Route>
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

// - Guardar quien creo cada Orden
// - Arreglar tema del buscador, es decir que al buscar y no encontrar no aparezca nuevo producto como si no hubiera nada... y performance
// - Remito Imprimible
// - Factura proforma 
// - Multisucursal
// - AFIP
// - Que los remitos no se puedan eliminar SINO ANULAR Y CON MOTIVO

// EXTRAS : 

// - Mirar el tema de la ALERTA DE BAJO STOCK

// Logros de este proyecto :

// - Crear un arbol infinito

// - Paginacion

// - Recurividad 

// - Indices 

// - Querys dinamicas 

// - Manejo de errores 
