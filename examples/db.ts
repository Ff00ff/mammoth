import { createDatabase, IntegerColumn, Now, TextColumn, TimestampWithTimeZoneColumn, UuidColumn, UuidGenerateV4 } from "../lib";

export class Test {
  id = new UuidColumn().primaryKey().notNull().default(new UuidGenerateV4());
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
  name = new TextColumn().notNull();
  value = new IntegerColumn();
}

const dbName = process.env.DATABASE_URL || 'postgres://postgres@localhost/test'

export const db = createDatabase(dbName, {
  test: new Test(),
});

export type Db = typeof db;
