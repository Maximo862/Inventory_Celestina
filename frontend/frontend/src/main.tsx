import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./features/auth/context/AuthContext.tsx";
import { CategoryProvider } from "./features/categories/context/CategoryContext.tsx";
import { ClientProvider } from "./features/clients/context/ClientContext.tsx";
import { ProductProvider } from "./features/products/context/ProductContext.tsx";
import { OrderProvider } from "./features/orders/context/OrderContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <OrderProvider>
        <CategoryProvider>
          <ProductProvider>
            <ClientProvider>
              <App />
            </ClientProvider>
          </ProductProvider>
        </CategoryProvider>
      </OrderProvider>
    </AuthProvider>
  </StrictMode>,
);
