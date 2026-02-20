import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "./features/auth/context/AuthContext.tsx";
import { CategoryProvider } from "./features/categories/context/CategoryContext.tsx";
import { ClientProvider } from "./features/clients/context/ClientContext.tsx";
import { ProductProvider } from "./features/products/context/ProductContext.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <CategoryProvider>
    <ProductProvider>
    <ClientProvider>
    <App />
    </ClientProvider>
    </ProductProvider>
    </CategoryProvider>
    </AuthProvider>
  </StrictMode>,
)
