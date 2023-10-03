import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '../../.build';
import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';
import { expectType} from 'tsd-lite';

const toSnap = <T extends Query<any>>(query: T): ResultSet<T> => {
  return undefined as any;
};

/** @dts-jest enable:test-type */

const foo = defineTable({
  id: uuid().primaryKey().default(`gen_random_uuid()`),
  createDate: timestampWithTimeZone().notNull().default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const db = defineDb({ foo }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

describe('delete', () => {
    test('should delete and returning id', () => {
        expectType<{id: string}>(toSnap(db.deleteFrom(db.foo).returning(`id`)))
    });

    test('should delete and await affected row count', async () => {
        expectType<number>(await db.deleteFrom(db.foo));

    });

    test('should delete and await rows', async () => {
        expectType<{id: string}[]>(await db.deleteFrom(db.foo).returning(`id`))
    });
});
