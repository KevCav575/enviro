import { Router }                  from 'express';
import type { Request, Response }  from 'express';
import bcrypt                      from 'bcrypt';
import { config }                  from '../config';
import { listUsers, findById, findByEmail, insertUser, removeUser } from '../db/store';
import { verifyJWT, requireRole }  from '../middleware/auth';
import { validateBody }            from '../middleware/validate';
import { uid }                     from '../utils';
import type { StoredUser, UserRole } from '../types';

const router = Router();

function toSafe(u: StoredUser) {
  const { id, nombre, empresa, email, rol, giro, proyecto_id } = u;
  return { id, nombre, empresa, email, rol, giro, proyecto_id };
}

// GET /api/users — admin only
router.get(
  '/',
  verifyJWT, requireRole('admin'),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      res.json((await listUsers()).map(toSafe));
    } catch (err) {
      console.error('[GET /users]', err);
      res.status(500).json({ error: 'Error interno.' });
    }
  },
);

// GET /api/users/:id — admin or self
router.get(
  '/:id',
  verifyJWT,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (req.user!.rol !== 'admin' && req.user!.sub !== id) {
        res.status(403).json({ error: 'Acceso denegado.' });
        return;
      }
      const user = await findById(id);
      if (!user) { res.status(404).json({ error: 'Usuario no encontrado.' }); return; }
      res.json(toSafe(user));
    } catch (err) {
      console.error('[GET /users/:id]', err);
      res.status(500).json({ error: 'Error interno.' });
    }
  },
);

// POST /api/users — admin only
router.post(
  '/',
  verifyJWT, requireRole('admin'),
  validateBody({ nombre: 'string', email: 'email', password: 'password', rol: 'role' }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, empresa = '', email, password, rol, giro, proyecto_id } = req.body as {
        nombre: string; empresa?: string; email: string; password: string;
        rol: string;    giro?: string;   proyecto_id?: string;
      };

      const existing = await findByEmail(email);
      if (existing) {
        res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico.' });
        return;
      }

      const pwd_hash = await bcrypt.hash(password, config.bcryptRounds);
      const user     = await insertUser({
        nombre, empresa, email, pwd_hash,
        rol:        rol as UserRole,
        giro,
        proyecto_id: proyecto_id ?? (rol === 'cliente' ? uid() : undefined),
      });

      res.status(201).json(toSafe(user));
    } catch (err) {
      console.error('[POST /users]', err);
      res.status(500).json({ error: 'Error interno.' });
    }
  },
);

// DELETE /api/users/:id — admin only
router.delete(
  '/:id',
  verifyJWT, requireRole('admin'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (id === req.user!.sub) {
        res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' });
        return;
      }
      await removeUser(id);
      res.json({ ok: true });
    } catch (err) {
      console.error('[DELETE /users/:id]', err);
      res.status(500).json({ error: 'Error interno.' });
    }
  },
);

export default router;
