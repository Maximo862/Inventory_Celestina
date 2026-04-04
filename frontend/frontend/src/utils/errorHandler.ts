import toast from "react-hot-toast";

// ============================================
// CONFIGURACIÓN DE ERRORES
// ============================================

interface ErrorConfig {
  message: string | ((error: any, itemName?: string) => string);
  icon?: string;
  duration?: number;
}

const ERROR_CODES: Record<string, ErrorConfig> = {
  DUPLICATE_NAME: {
    message: (_, itemName) =>
      itemName
        ? `Ya existe "${itemName}"`
        : "Ya existe un elemento con ese nombre",
    icon: "⚠️",
    duration: 5000,
  },
  HAS_REFERENCES: {
    message: "No se puede eliminar porque está en uso por otros registros",
    icon: "🔗",
    duration: 6000,
  },
  CATEGORY_IN_USE: {
    message: "No se puede eliminar la categoría porque tiene productos asociados",
    icon: "📦",
    duration: 6000,
  },
  OUT_OF_RANGE: {
    message: "Un numero esta fuera del rango permitido",
    icon: "❌",
    duration: 6000,
  },
  INVALID_REFERENCE: {
    message: "Referencia inválida",
    icon: "❌",
  },
  NOT_FOUND: {
    message: "Elemento no encontrado",
  },
  CATEGORY_REQUIRED: {
    message: "Debes seleccionar una categoría",
  },
  DUPLICATE_ENTRY: {
    message: (error) => error.message,
  },
  INSUFFICIENT_STOCK: {
    message: (error) => error.message,
  },
  FORBIDDEN: {
    message: (error) => error.message,
  },
};

const STATUS_CODE_ERRORS: Record<number, ErrorConfig> = {
  400: {
    message: "Datos inválidos",
  },
  403: {
    message: "No tienes permisos para esta acción",
  },
};

// ============================================
// LÓGICA DE MANEJO DE ERRORES
// ============================================

export function handleError(error: any, action: string, itemName?: string) {
  console.error(`Error al ${action}:`, error);

  const errorConfig = getErrorConfig(error);
  const message = resolveMessage(errorConfig.message, error, action, itemName);

  toast.error(message, {
    icon: errorConfig.icon,
    duration: errorConfig.duration,
  });
}

function getErrorConfig(error: any): ErrorConfig {
  // 1. Buscar por error.code
  if (error.code && ERROR_CODES[error.code]) {
    return ERROR_CODES[error.code];
  }

  // 2. Buscar por statusCode
  if (error.statusCode) {
    // Caso especial: statusCode >= 500
    if (error.statusCode >= 500) {
      return { message: "Error del servidor. Intenta nuevamente" };
    }

    // Buscar en mapa de statusCode
    if (STATUS_CODE_ERRORS[error.statusCode]) {
      return STATUS_CODE_ERRORS[error.statusCode];
    }
  }

  // 3. Fallback: error genérico
  return { message: "" }; // El mensaje se construye en resolveMessage
}

function resolveMessage(
  messageConfig: string | ((error: any, itemName?: string) => string),
  error: any,
  action: string,
  itemName?: string
): string {
  // Si es función, ejecutarla
  if (typeof messageConfig === "function") {
    return messageConfig(error, itemName);
  }

  // Si es string y no está vacío, retornarlo
  if (messageConfig) {
    return messageConfig;
  }

  // Fallback: mensaje genérico con acción
  return `Error al ${action} el elemento`;
}
