import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/nayab_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'nayab_luxury_jwt_super_secret_key_2026_horology',
  CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  COOKIE_NAME: 'nayab_auth_token',
};
