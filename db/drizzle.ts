import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import { DB_URL } from '@/constants'
import * as schema from '@/db/schema'

const sql = neon(DB_URL)

export const db = drizzle(sql, { schema })
