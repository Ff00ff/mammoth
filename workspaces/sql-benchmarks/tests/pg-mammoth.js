import { integer, text, uuid, defineTable, defineDb } from '@ff00ff/mammoth';
import pg from 'pg';

export const setup = () => {
  const pool = new pg.Pool({
    connectionString: process.env.PG,
  });
  const queryExecutor = async (query, parameters) => {
    const result = await pool.query(query, parameters);

    return {
      affectedCount: result.rowCount,
      rows: result.rows,
    };
  };
  const item = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    name: text().notNull(),
    value: integer(),
  });
  const db = defineDb(
    {
      item,
    },
    queryExecutor,
  );

  return {
    name: `pg-mammoth`,

    async cleanUp() {
      await pool.end();
    },

    async truncate() {
      await db.truncate(db.item);
    },

    async select() {
      const rows = await db
        .select(db.item.id, db.item.name, db.item.value)
        .from(db.item)
        .where(db.item.value.eq(1))
        .limit(1000);
      return rows;
    },

    async insert() {
      const rows = await db
        .insertInto(db.item)
        .values({
          name: `Test`,
          value: 1,
        })
        .returning(`id`);
      return rows;
    },
  };
};
