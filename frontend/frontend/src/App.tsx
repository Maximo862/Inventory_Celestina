import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./features/auth/pages/Login";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { Home } from "./pages/Home";
import { DashboardLayout } from "./pages/DashboardLayout";
import { CategoriesPage } from "./features/categories/pages/CategoriesPage";
import { Toaster } from "react-hot-toast";
import { ClientsPage } from "./features/clients/pages/ClientsPage";
import { ProductsPage } from "./features/products/pages/ProductsPage";

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

