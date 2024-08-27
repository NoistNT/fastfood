import { config } from 'dotenv'

config()

if (!process.env.DB_URL) {
  throw new Error('Missing DB_URL')
}

export const DB_URL = process.env.DB_URL
