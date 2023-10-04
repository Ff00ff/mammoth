import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '../../.build';
import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';
import { expectType } from 'tsd-lite';

const toSnap = <T extends Query<any>>(query: T): ResultSet<T> => {
  return undefined as any;
};

const foo = defineTable({
  id: uuid().primaryKey().default(`gen_random_uuid()`),
  createDate: timestampWithTimeZone().notNull().default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const db = defineDb({ foo }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

describe('truncate', () => {
    test('should truncate', () => {
        expectType<never>(toSnap(db.truncate(db.foo)));
    });

    test('should truncate ans await affected row count', async () => {
        expectType<number>(await db.truncate(db.foo));
    })
});
