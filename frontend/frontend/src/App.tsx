import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./features/auth/pages/Login";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { Home } from "./pages/Home";
import { DashboardLayout } from "./pages/DashboardLayout";
import { CategoriesPage } from "./features/categories/pages/CategoriesPage";
import { Toaster } from "react-hot-toast";
import { ClientsPage } from "./features/clients/pages/ClientsPage";
import { ProductsPage } from "./features/products/pages/ProductsPage";
import { SubcategoriesPage } from "./features/categories/pages/SubcategoriesPage";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoutes />}>
            <Route element={<DashboardLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route
                path="/categories/:categoryId/subcategories"
                element={<SubcategoriesPage />}
              />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/clients" element={<ClientsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

// 1️⃣ Categorías + subcategorías + código
// ➡️ porque todo depende de eso

// 2️⃣ Productos mejorados
// ➡️ ahora ya se clasifican bien

// 3️⃣ Remitos (entradas / salidas)
// ➡️ ahora el stock empieza a ser serio

// 4️⃣ Roles
// ➡️ cuando ya hay flujo real

// EXTRAS :

// - Select para elejeir si remitente o RI o membresista

// - Barra de busqueda por CODE en productos

// - Manejar errores de rango con : 'ER_WARN_DATA_OUT_OF_RANGE'

// - Arreglar lo de la paginacion y hacer que funcione o directamente sacarlo.

// Logros de este proyecto :

// - Crear un arbol infinito

// - Paginacion
