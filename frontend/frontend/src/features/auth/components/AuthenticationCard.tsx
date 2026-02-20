import React from "react";
import { Link } from "react-router-dom";
import { useAuthActions } from "../hooks/useAuthActions";

interface ButtonConfig {
  textRedirect: string;
  redirect: string;
  submit: string;
}

interface Props {
  Handlesubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  button: ButtonConfig;
  tittle: string;
  inputs: React.ReactNode;
  path: string;
}

export function AuthenticationCard({
  Handlesubmit,
  button,
  tittle,
  inputs,
  path,
}: Props) {
  const { errors } = useAuthActions();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] p-6">
      <form
        onSubmit={Handlesubmit}
        className="w-full max-w-md bg-white border-2 border-[#E2E8F0] rounded-2xl shadow-lg p-10"
      >
        {/* Título grande y legible */}
        <h1 className="text-4xl font-bold text-[#0F172A] mb-8 text-center">
          {tittle}
        </h1>

        {/* Inputs con espaciado generoso */}
        <div className="flex flex-col gap-6">{inputs}</div>

        {/* Mensaje de error muy visible */}
        {errors && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-[#DC2626] rounded-lg">
            <p className="text-[#DC2626] text-lg font-semibold text-center">
              {errors}
            </p>
          </div>
        )}

        {/* Botón principal - GRANDE y CLARO */}
        <button
          type="submit"
          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xl font-bold py-5 rounded-xl mt-8 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          {button.submit}
        </button>

        {/* Link secundario con buen contraste */}
        <p className="text-base text-[#475569] mt-6 text-center">
          {button.textRedirect}{" "}
          <Link
            className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold underline text-lg"
            to={path}
          >
            {button.redirect}
          </Link>
        </p>
      </form>
    </div>
  );
}
