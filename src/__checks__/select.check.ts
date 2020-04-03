import { integer, text, timestamptz, uuid } from '../columns/dataTypes';

import { createDatabase } from '../database';
import { defineTable } from '../defines';

const item = defineTable({
  id: uuid()
    .primary()
    .notNull()
    .default(`gen_random_uuid()`),
  createdAt: timestamptz()
    .notNull()
    .default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const db = createDatabase(process.env.DATABASE_URL!, {
  item,
});

// @dts-jest:pass:snap should return string, Date, string, number | undefined
db.select(db.item.id, db.item.createdAt, db.item.name, db.item.value).from(db.item);
