import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from '@/db/schema';

import { DB_URL } from '@/constants';

const sql = neon(DB_URL);

export const db = drizzle(sql, { schema });
