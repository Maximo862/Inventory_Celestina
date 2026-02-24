import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

interface DatabaseError extends Error {
  code?: string;
}

export function errorHandler(
  err: DatabaseError | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // 1. Errores de negocio (AppError)
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
    });
  }

  // 2. Errores de Infraestructura (MySQL)
  const dbErrorMap: Record<string, { status: number; error: string; code: string }> = {
    ER_DUP_ENTRY: {
      status: 409,
      error: "Ya existe un elemento con ese nombre",
      code: "DUPLICATE_NAME",
    },
    ER_NO_REFERENCED_ROW_2: {
      status: 400,
      error: "Referencia inválida",
      code: "INVALID_REFERENCE",
    },
    ER_ROW_IS_REFERENCED_2: {
      status: 409,
      error: "No se puede eliminar porque tiene referencias",
      code: "HAS_REFERENCES",
    },
    ER_BAD_NULL_ERROR: {
      status: 400,
      error: "La categoría es obligatoria",
      code: "CATEGORY_REQUIRED",
    },
  };

  if (err.code && dbErrorMap[err.code]) {
    const e = dbErrorMap[err.code];
    return res.status(e.status).json({
      error: e.error,
      code: e.code,
    });
  }

  // 3. Errores genéricos con "not found" (legacy)
  if (err.message?.includes("not found")) {
    return res.status(404).json({
      error: err.message,
      code: "NOT_FOUND",
    });
  }

  // 4. Error genérico del servidor
  return res.status(500).json({
    error: "Error interno del servidor",
    code: "SERVER_ERROR",
  });
}