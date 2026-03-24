import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useHandleForm } from "../hooks/useHandleForm";
import { useRedirect } from "@/hooks/useRedirect";
import { AuthenticationCard } from "../components/AuthenticationCard";

export function Login() {
  const { isAuthenticated } = useContext(AuthContext)!;

  useRedirect({
    condition: isAuthenticated,
    path: "/home",
  });

  const { handleSubmit, setUser, user } = useHandleForm("login");

  return (
    <AuthenticationCard
      Handlesubmit={handleSubmit}
      tittle="Ingresar"
      inputs={
        <>
          <div>
            <label
              htmlFor="email"
              className="block text-[#0F172A] text-lg font-semibold mb-2"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
              placeholder="ejemplo@correo.com"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              autoComplete="email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-[#0F172A] text-lg font-semibold mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
              placeholder="••••••••"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>
        </>
      }
      button={{
        submit: "Ingresar",
        // textRedirect: "¿No tiene cuenta?",
        // redirect: "Crear cuenta",
      }}
      // path="/register"
    />
  );
}
