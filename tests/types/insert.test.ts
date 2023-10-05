import {
    defineDb,
    defineTable,
    integer,
    raw,
    serial,
    text,
    timestampWithTimeZone,
    uuid,
  } from '../../.build';
import { Table } from '../../.build/TableType';
import { Column } from '../../.build/column';
import { InsertQuery } from '../../.build/insert';
import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';
import { expectType, expectError } from 'tsd-lite';

const toSnap = <T extends Query<any>>(query: T): ResultSet<T> => {
    return undefined as any;
};

const foo = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
});

const serialTest = defineTable({
    id: serial().primaryKey(),
    value: integer(),
});

const db = defineDb({ foo, serialTest }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

describe('insert', () => {
    test('should insert and returning count', () => {
        expectType<number>(toSnap(db.insertInto(db.foo).values({ name: `Test` })));
    });

    test('should insert multiple rows and returning count', () => {
        expectType<number>(toSnap(db.insertInto(db.foo).values([{ name: `Test` }, { name: `Test 2` }])));
    });

    test('should insert default column', () => {
        expectType<number>(toSnap(db.insertInto(db.foo).values({ name: `Test`, createDate: new Date() })));
    });

    test('should not insert unknown column', () => {
        expectError(toSnap(db.insertInto(db.foo).values({ name: `Test`, asd: `Test` })));
    });

    test('should not insert invalid type in known column', () => {
        expectError(toSnap(db.insertInto(db.foo).values({ name: 123 })));
    });

    test('should not insert multiple rows with invalid colums', () => {
        expectError(toSnap(db.insertInto(db.foo).values([{ name: `Test` }, { name: `Test 2`, asd: 123 }])));
    });

    test('should insert and await affect count', async () => {
        expectType<number>(await db.insertInto(db.foo).values({ name: `Test` }));
    });

    test('should insert-returning and await rows', async () => {
        expectType<{name: string}[]>(await db.insertInto(db.foo).values({ name: `Test` }).returning(`name`));
    });

    test('should insert without explicit value for column serial', () => {
        expectType<
            InsertQuery<
                Table<'serialTest', {
                    id: Column<'id', 'serialTest', number, true, true, undefined>;
                    value: Column<'value', 'serialTest', number, false, false, undefined>;
                }>,
                number,
                {
                    id: Column<'id', 'serialTest', number, true, true, undefined>;
                    value: Column<'value', 'serialTest', number, false, false, undefined>;
                }
            >
        >(db.insertInto(db.serialTest).values({ value: 123 }));
    });

    test('should insert with expression of the not-null correct type', () => {
        expectType<
            InsertQuery<
                Table<'serialTest', {
                    id: Column<'id', 'serialTest', number, true, true, undefined>;
                    value: Column<'value', 'serialTest', number, false, false, undefined>;
                }>,
                number,
                {
                    id: Column<'id', 'serialTest', number, true, true, undefined>;
                    value: Column<'value', 'serialTest', number, false, false, undefined>;
                }
            >
        >(db.insertInto(db.serialTest).values({value: raw<number, true>`get_value()`}));
    });

    test('should insert with expression of the nullable correct type', () => {
        expectType<
            InsertQuery<
                Table<'serialTest', {
                    id: Column<'id', 'serialTest', number, true, true, undefined>;
                    value: Column<'value', 'serialTest', number, false, false, undefined>;
                }>,
                number,
                {
                    id: Column<'id', 'serialTest', number, true, true, undefined>;
                    value: Column<'value', 'serialTest', number, false, false, undefined>;
                }
            >
        >(db.insertInto(db.serialTest).values({value: raw<number, false>`get_value()`}));
    });

    test('should not insert with wrong type of expression', () => {
        expectError(db.insertInto(db.serialTest).values({value: raw<string>`get_value()`}));
    });

    test('should insert using subquery', () => {
        expectType<
            InsertQuery<
                Table<'foo', {
                    id: Column<'id', 'foo', string, true, true, undefined>;
                    createDate: Column<'createDate', 'foo', Date, true, true, undefined>;
                    name: Column<'name', 'foo', string, true, false, undefined>;
                    value: Column<'value', 'foo', number, false, false, undefined>;
                }>,
                number,
                {
                    id: Column<'id', 'foo', string, true, true, undefined>;
                    createDate: Column<'createDate', 'foo', Date, true, true, undefined>;
                    name: Column<'name', 'foo', string, true, false, undefined>;
                    value: Column<'value', 'foo', number, false, false, undefined>;
                }
            >
        >(db.insertInto(db.foo).values({ name: db.select(db.foo.name.concat(` 2`)).from(db.foo).limit(1) }));
    });
});
  