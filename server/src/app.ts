import express      from 'express';
import cors         from 'cors';
import helmet       from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit    from 'express-rate-limit';
import { config }   from './config';
import authRouter   from './routes/auth';
import usersRouter  from './routes/users';

const app = express();

app.use(helmet());

app.use(cors({
  origin:         config.corsOrigin,
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs:        60_000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.' },
});

app.use('/api/auth',  authLimiter, authRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// 404 fallback — debe ser el último middleware
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

export default app;
