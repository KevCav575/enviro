/**
 * Prisma-backed user repository.
 *
 * Drop-in replacement for the JSON-file store (db/store.ts).
 * Switch the import in routes/auth.ts and routes/users.ts to this file
 * once `DATABASE_URL` is configured and `npx prisma migrate deploy` has run.
 *
 * All email comparisons are case-insensitive at the query level.
 */

import { PrismaClient } from '@prisma/client';
import type { StoredUser, UserRole } from '../types';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

type PrismaUser = {
  id:          string;
  nombre:      string;
  empresa:     string;
  email:       string;
  pwd_hash:    string;
  rol:         string;
  giro:        string | null;
  proyecto_id: string | null;
  created_at:  Date;
};

function toStoredUser(u: PrismaUser): StoredUser {
  return {
    id:          u.id,
    nombre:      u.nombre,
    empresa:     u.empresa,
    email:       u.email,
    pwd_hash:    u.pwd_hash,
    rol:         u.rol as UserRole,
    giro:        u.giro        ?? undefined,
    proyecto_id: u.proyecto_id ?? undefined,
    created_at:  u.created_at.toISOString(),
  };
}

export const userRepository = {
  async findByEmail(email: string): Promise<StoredUser | undefined> {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    return user ? toStoredUser(user as PrismaUser) : undefined;
  },

  async findById(id: string): Promise<StoredUser | undefined> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toStoredUser(user as PrismaUser) : undefined;
  },

  async insert(data: Omit<StoredUser, 'id' | 'created_at'>): Promise<StoredUser> {
    const user = await prisma.user.create({
      data: {
        nombre:      data.nombre,
        empresa:     data.empresa,
        email:       data.email.toLowerCase(),
        pwd_hash:    data.pwd_hash,
        rol:         data.rol,
        giro:        data.giro        ?? null,
        proyecto_id: data.proyecto_id ?? null,
      },
    });
    return toStoredUser(user as PrismaUser);
  },

  async update(
    id: string,
    partial: Partial<Omit<StoredUser, 'id' | 'created_at'>>,
  ): Promise<StoredUser | undefined> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data:  {
          ...partial,
          email:       partial.email?.toLowerCase(),
          giro:        partial.giro        ?? undefined,
          proyecto_id: partial.proyecto_id ?? undefined,
        },
      });
      return toStoredUser(user as PrismaUser);
    } catch {
      return undefined;
    }
  },

  async remove(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } }).catch(() => {});
  },

  async list(): Promise<StoredUser[]> {
    const users = await prisma.user.findMany({ orderBy: { created_at: 'asc' } });
    return (users as PrismaUser[]).map(toStoredUser);
  },
};
