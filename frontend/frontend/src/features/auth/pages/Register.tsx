import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRedirect } from "@/hooks/useRedirect";
import { useHandleForm } from "../hooks/useHandleForm";
import { AuthenticationCard } from "../components/AuthenticationCard";

export function Register() {
  const { isAuthenticated } = useContext(AuthContext)!;

  useRedirect({
    condition: isAuthenticated,
    path: "/home",
  });

  const { handleSubmit, setUser, user } = useHandleForm("register");

  return (
    <AuthenticationCard
      Handlesubmit={handleSubmit}
      tittle="Crear cuenta"
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
              className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200"
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
              className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200"
              placeholder="••••••••"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              autoComplete="new-password"
            />
          </div>
        </>
      }
      button={{
        submit: "Crear cuenta",
        textRedirect: "¿Ya tiene cuenta?",
        redirect: "Ingresar",
      }}
      path="/login"
    />
  );
}
