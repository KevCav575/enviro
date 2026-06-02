/**
 * Vercel Serverless entry point.
 *
 * Vercel detecta automáticamente este archivo y lo convierte en una función serverless.
 * Todas las rutas /api/* llegan aquí a través de las rewrites en vercel.json.
 *
 * IMPORTANTE: En Vercel el filesystem es de solo lectura.
 * El JSON file store NO funciona — debes configurar DATABASE_URL en las
 * variables de entorno del proyecto en vercel.com → Settings → Environment Variables.
 */
import app from '../server/src/app';

export default app;
