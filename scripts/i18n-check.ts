import en from '../messages/en.json';
import es from '../messages/es.json';

const flat = (obj: object, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? flat(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );

const enKeys = new Set(flat(en));
const esKeys = new Set(flat(es));

const missingInEs = [...enKeys].filter((key) => !esKeys.has(key));
const missingInEn = [...esKeys].filter((key) => !enKeys.has(key));

if (missingInEs.length === 0 && missingInEn.length === 0) {
  process.stdout.write(`i18n key-sync OK (${enKeys.size}/${esKeys.size} keys matched)\n`);
} else {
  if (missingInEs.length > 0) {
    console.error(`Keys missing in messages/es.json:`);
    missingInEs.forEach((key) => console.error(`  - ${key}`));
  }
  if (missingInEn.length > 0) {
    console.error(`Keys missing in messages/en.json:`);
    missingInEn.forEach((key) => console.error(`  - ${key}`));
  }
  process.exit(1);
}
