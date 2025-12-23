const isProduction = process.env.NODE_ENV === 'production';

const missingEnvError = (key: string) => {
  if (isProduction) {
    throw new Error(`Missing required environment variable: ${key}`);
  } else {
    console.warn(`⚠️  Missing environment variable: ${key} (using development defaults)`);
  }
};

// Required in production, optional in development
const requiredEnvVars = ['DB_URL', 'NEXT_PUBLIC_BASE_URL'];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) missingEnvError(key);
});

// Provide defaults for development
export const DB_URL = process.env.DB_URL || 'postgresql://user:password@localhost:5432/fastfood';
export const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
