import { createDatabase, IntegerColumn, Now, TextColumn, TimestampWithTimeZoneColumn, UuidColumn, UuidGenerateV4 } from "../src";

export class Test {
  id = new UuidColumn().primaryKey().notNull().default(new UuidGenerateV4());
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
  name = new TextColumn().notNull();
  value = new IntegerColumn();
}

export const db = createDatabase({
  test: new Test(),
});

export type Db = typeof db;

