import { defineConfig } from 'drizzle-kit'

import { DB_URL } from './constants'

export default defineConfig({
  schema: './db/schema.ts',
  dialect: 'postgresql',
  out: './drizzle',
  dbCredentials: { url: DB_URL },
  verbose: true,
  strict: true
})
