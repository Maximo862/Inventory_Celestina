export class AppError extends Error {
    status: number;
    code: string;

    constructor(message: string, status: number, code: string) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'AppError';
    }
}

// Factory functions para errores comunes (opcional pero recomendado)
export class NotFoundError extends AppError {
    constructor(resource: string, id?: number | string) {
        const message = id
            ? `${resource} con el id ${id} no se ha encontrado`
            : `${resource} no se encontro`;
        super(message, 404, 'NOT_FOUND');
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class DuplicateError extends AppError {
    constructor(resource: string, field: string, value: string) {
        super(
            `${resource} con ${field} '${value}' ya existe`,
            409,
            'DUPLICATE_ENTRY'
        );
    }
}

export class InsufficientStockError extends AppError {
    constructor(productName: string, available: number, requested: number) {
        super(
            `Stock insuficiente para "${productName}". Disponible: ${available}, requerido: ${requested}`,
            400,
            'INSUFFICIENT_STOCK'
        );
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'No tienes permiso para realizar esta acción') {
        super(message, 403, 'FORBIDDEN');
    }
}