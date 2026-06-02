import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (!val) throw new Error(`Variable de entorno requerida: ${key}`);
  return val;
}

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  port:           parseInt(process.env.PORT ?? '3001', 10),
  isProd,

  // JWT — mínimo 32 chars en producción
  jwtSecret:      requireEnv('JWT_SECRET', isProd ? undefined : 'dev_secret_CHANGE_before_deploying_to_prod_min32ch'),
  jwtExpiresIn:   '8h',

  // Cookie
  cookieName:     'egx_session',
  cookieMaxAgeMs: 8 * 60 * 60 * 1000,

  // bcrypt — cost 12 es el estándar de seguridad actual
  bcryptRounds:   12,

  // CORS
  corsOrigin:     process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  // Almacenamiento (JSON file — reemplazar con DATABASE_URL para MySQL)
  dataFile:       process.env.DATA_FILE ?? './data/users.json',

  // MySQL (opcional — si está configurado, usar userRepository en lugar de store)
  databaseUrl:    process.env.DATABASE_URL,
  useDatabase:    !!process.env.DATABASE_URL,
};
