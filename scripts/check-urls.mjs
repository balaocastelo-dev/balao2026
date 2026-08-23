import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const checks = [
  ['carousel_images', 'image_url'],
  ['controle_parts', 'photo_url'],
  ['controle_part_withdrawals', 'part_snapshot_photo_url'],
  ['order_items', 'product_image'],
];
for (const [t, c] of checks) {
  const r = await db.execute(`SELECT COUNT(*) AS n FROM "${t}" WHERE "${c}" LIKE '%supabase.co%'`);
  const r2 = await db.execute(`SELECT COUNT(*) AS n FROM "${t}" WHERE "${c}" LIKE '/uploads/%'`);
  console.log(`${t}.${c}: supabase=${r.rows[0].n} | local=/uploads/=${r2.rows[0].n}`);
}
