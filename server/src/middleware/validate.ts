import type { Request, Response, NextFunction } from 'express';

type FieldType = 'string' | 'email' | 'password' | 'role';
type Shape = Record<string, FieldType>;

const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = new Set(['admin', 'consultor', 'cliente']);

export function validateBody(shape: Shape) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body as Record<string, unknown>;

    for (const [field, type] of Object.entries(shape)) {
      const val = body[field];

      if (val === undefined || val === null || val === '') {
        res.status(400).json({ error: `El campo '${field}' es requerido.` });
        return;
      }

      if (typeof val !== 'string') {
        res.status(400).json({ error: `El campo '${field}' debe ser texto.` });
        return;
      }

      if (type === 'email' && !EMAIL_RE.test(val)) {
        res.status(400).json({ error: 'El correo electrónico no tiene un formato válido.' });
        return;
      }

      if (type === 'password' && val.length < 6) {
        res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
        return;
      }

      if (type === 'role' && !VALID_ROLES.has(val)) {
        res.status(400).json({ error: `Rol inválido. Valores permitidos: admin, consultor, cliente.` });
        return;
      }
    }

    next();
  };
}
