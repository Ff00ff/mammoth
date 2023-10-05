import {
    defineDb,
    defineTable,
    integer,
    text,
    timestampWithTimeZone,
    uuid,
} from '../../.build';

import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';
import { expectType } from 'tsd-lite';

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

describe('update', () => {
    test('should update and returning id', () => {
        expectType<{
            id: string;
        }>(toSnap(db.update(db.foo).set({ name: `Test`, value: 123 }).returning(`id`)));
    });

    test('should update and returning two columns', () => {
        expectType<{
            id: string;
            name: string;
        }>(toSnap(db.update(db.foo).set({ name: `Test`, value: 123 }).returning(`id`, `name`)));
    });

    test('should update without returning and return number', () => {
        expectType<number>(toSnap(db.update(db.foo).set({ name: `Test`, value: 123 })));
    });

    test('should update and await affected count', async () => {
        expectType<number>(await db.update(db.foo).set({ name: `Test` }));
    });

    test('should update-returning and await rows', async () => {
        expectType<{name: string}[]>(await db.update(db.foo).set({ name: `Test` }).returning(`name`));
    });
});
  