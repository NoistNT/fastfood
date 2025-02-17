import { config } from 'dotenv';

config({ path: '.env.local' });

const missingEnvError = (key: string) => {
  throw new Error(`Missing environment variable: ${key}`);
};

const requiredEnvVars = ['DB_URL', 'BASE_URL'];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) missingEnvError(key);
});

export const { DB_URL, BASE_URL } = process.env as Record<string, string>;
