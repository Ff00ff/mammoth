import {
  createDatabase,
  IntegerColumn,
  Now,
  TextColumn,
  TimestampWithTimeZoneColumn,
  UuidColumn,
  UuidGenerateV4,
} from '../../modules/mammoth/src';

export class Test {
  id = new UuidColumn()
    .primaryKey()
    .notNull()
    .default(new UuidGenerateV4());
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
  name = new TextColumn().notNull();
  value = new IntegerColumn();
}

class TestWithTypedText {
  id = new UuidColumn()
    .primaryKey()
    .notNull()
    .default(new UuidGenerateV4());
  value = new TextColumn<'FOO' | 'BAR' | 'BAZ'>().notNull();
}

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres@localhost/test';

export const db = createDatabase(databaseUrl, {
  test: new Test(),
  testWithTypedText: new TestWithTypedText(),
});

export type Db = typeof db;
