import { Request, Response, NextFunction } from "express";

interface DatabaseError extends Error {
  code?: string;
}

export function errorHandler(
  err: DatabaseError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);

  const errorMap: Record<
    string,
    { status: number; error: string; code: string }
  > = {
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

  if (err.code && errorMap[err.code]) {
    const e = errorMap[err.code];
    return res.status(e.status).json({
      error: e.error,
      code: e.code,
    });
  }

 if (err.message.includes("not found")) {
    return res.status(404).json({
      error: "No encontrado",
      code: "NOT_FOUND",
    });
  }

  return res.status(500).json({
    error: "Server error",
    code: "SERVER_ERROR",
  });
}
