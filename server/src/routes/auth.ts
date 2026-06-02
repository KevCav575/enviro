import { Router }                  from 'express';
import type { Request, Response }  from 'express';
import bcrypt                      from 'bcrypt';
import jwt                         from 'jsonwebtoken';
import { config }                  from '../config';
import { findByEmail, findById, insertUser, updateUser } from '../db/store';
import { verifyJWT }               from '../middleware/auth';
import { validateBody }            from '../middleware/validate';
import { uid }                     from '../utils';
import type { JwtPayload, SafeUser, StoredUser } from '../types';

const router = Router();

// ── Helpers ────────────────────────────────────────────────────────────────

function toSafe(u: StoredUser): SafeUser {
  const { id, nombre, empresa, email, rol, giro, proyecto_id } = u;
  return { id, nombre, empresa, email, rol, giro, proyecto_id };
}

function issueToken(res: Response, payload: JwtPayload): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    secure:   config.isProd,
    sameSite: 'strict',
    maxAge:   config.cookieMaxAgeMs,
    path:     '/',
  });
}

// Dummy hash usado cuando el usuario no existe — evita user-enumeration por timing
const DUMMY_HASH = '$2b$12$xxxxxxxxxxxxxxxxxxxxxxuGSBXMcBIze5YKk/5QgXO6nHBOqgmPuy';

// ── Routes ─────────────────────────────────────────────────────────────────

router.post(
  '/login',
  validateBody({ email: 'email', password: 'string' }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };

      const user = await findByEmail(email);
      const hash  = user?.pwd_hash ?? DUMMY_HASH;
      const valid = await bcrypt.compare(password, hash);

      if (!user || !valid) {
        res.status(401).json({ error: 'Credenciales incorrectas.' });
        return;
      }

      issueToken(res, { sub: user.id, rol: user.rol });
      res.json({ user: toSafe(user) });
    } catch (err) {
      console.error('[POST /auth/login]', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },
);

router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie(config.cookieName, { path: '/' });
  res.json({ ok: true });
});

router.get('/me', verifyJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await findById(req.user!.sub);
    if (!user) {
      res.clearCookie(config.cookieName, { path: '/' });
      res.status(401).json({ error: 'Usuario no encontrado.' });
      return;
    }
    res.json({ user: toSafe(user) });
  } catch (err) {
    console.error('[GET /auth/me]', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

router.post(
  '/register',
  validateBody({ nombre: 'string', empresa: 'string', giro: 'string', email: 'email', password: 'password' }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, empresa, giro, email, password } = req.body as {
        nombre: string; empresa: string; giro: string; email: string; password: string;
      };

      const existing = await findByEmail(email);
      if (existing) {
        res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico.' });
        return;
      }

      const pwd_hash    = await bcrypt.hash(password, config.bcryptRounds);
      const proyecto_id = uid();
      const user        = await insertUser({ nombre, empresa, email, pwd_hash, rol: 'cliente', giro, proyecto_id });

      issueToken(res, { sub: user.id, rol: user.rol });
      res.status(201).json({ user: toSafe(user), proyecto_id });
    } catch (err) {
      console.error('[POST /auth/register]', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },
);

router.patch(
  '/password',
  verifyJWT,
  validateBody({ currentPassword: 'string', newPassword: 'password' }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

      const user = await findById(req.user!.sub);
      if (!user) { res.status(401).json({ error: 'Usuario no encontrado.' }); return; }

      const valid = await bcrypt.compare(currentPassword, user.pwd_hash);
      if (!valid) { res.status(401).json({ error: 'Contraseña actual incorrecta.' }); return; }

      if (currentPassword === newPassword) {
        res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la actual.' });
        return;
      }

      const pwd_hash = await bcrypt.hash(newPassword, config.bcryptRounds);
      await updateUser(user.id, { pwd_hash });
      res.json({ ok: true });
    } catch (err) {
      console.error('[PATCH /auth/password]', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },
);

export default router;
