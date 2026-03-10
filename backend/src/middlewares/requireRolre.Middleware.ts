import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para verificar que el usuario tenga un rol específico
 * @param allowedRoles - Rol o array de roles permitidos
 */
export function requireRole(allowedRoles: 'admin' | 'employee' | ('admin' | 'employee')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          error: 'No autenticado',
          code: 'UNAUTHORIZED'
        });
      }

      // Normalizar a array para facilitar la verificación
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Verificar si el usuario tiene alguno de los roles permitidos
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Acceso denegado - Permisos insuficientes',
          code: 'FORBIDDEN'
        });
      }

      next();
    } catch (error) {
      console.error('Error en requireRole middleware:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'SERVER_ERROR'
      });
    }
  };
}