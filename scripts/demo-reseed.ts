/**
 * Demo reseed: resets the SHOWCASE database to pristine demo content.
 * Runs from .github/workflows/demo-reseed.yml (daily + manual dispatch).
 *
 * SAFETY: SHOWCASE_DB_URL must point ONLY at the showcase Neon branch.
 * Never dev/CI branches (E2E depends on them), never client branches.
 */
import { readFileSync } from 'node:fs';

import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.SHOWCASE_DB_URL;
if (!dbUrl) {
  throw new Error('SHOWCASE_DB_URL is not set — refusing to run without an explicit target');
}

const sql = neon(dbUrl);

function statements(file: string): string[] {
  return readFileSync(file, 'utf8')
    .split(/;\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => (part.endsWith(';') ? part : `${part};`));
}

for (const file of ['scripts/sql/dev-reset.sql', 'scripts/sql/dev-seed-minimal.sql']) {
  const parts = statements(file);
  for (const part of parts) {
    const code = part
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .trim();
    if (!code || /^BEGIN;?$/i.test(code) || /^COMMIT;?$/i.test(code)) continue;
    await sql.query(code);
  }
  console.log(`applied ${file}`);
}

const tables = await sql`SELECT count(*) AS n FROM public.products`;
console.log(`products after reseed: ${(tables[0] as { n: number }).n}`);
