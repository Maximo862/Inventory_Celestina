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

//CODE en CATEGORIAS

// EXTRAS : 

//- Filtrado con paginacion en el frontend, porque solo filtra con esos que traj el backend osea con esa page  

//- Que no se pueda crear subcategorias de subcategorias porque ahi ya es un quilombo todo 

// - Si vos pones una entrada de un producto y le pones que entraron 5 a un precio de 100 por ejemplo lo cual tendria que ser 500$ en total, en products toma el precio unitario entonces si el precio unitario era de por ejemplo 10.000, tina un total de 50.000$ en total. 

// - Mirar el tema de la ALERTA DE BAJO STOCK

// - Barra de busqueda por CODE en productos

// - Manejar errores de rango con : 'ER_WARN_DATA_OUT_OF_RANGE'

// - Arreglar lo de la paginacion y hacer que funcione o directamente sacarlo.

// - Arreglar lo del precio para que sea en argentino y no con tofixed o esos puntos que se ponen en cualquier lado y confunden

// Logros de este proyecto :

// - Crear un arbol infinito

// - Paginacion
