import {
  TableRow,
  arrayAgg,
  coalesce,
  count,
  defineDb,
  defineTable,
  integer,
  raw,
  star,
  sum,
  text,
  timestampWithTimeZone,
  uuid,
} from '../../.build';

import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';
import { expectType, expectError } from 'tsd-lite';

const toSnap = <T extends Query<any>>(query: T): ResultSet<T> => {
  return undefined as any;
};

const toTableRow = <T>(table: T): TableRow<T> => {
  return undefined as any;
};

const foo = defineTable({
  id: uuid().primaryKey().default(`gen_random_uuid()`),
  createDate: timestampWithTimeZone().notNull().default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const bar = defineTable({
  id: uuid().primaryKey().default(`gen_random_uuid()`),
  startDate: timestampWithTimeZone().notNull().default(`now()`),
  endDate: timestampWithTimeZone().notNull().default(`now()`),
  value: integer(),
  fooId: uuid().references(foo, 'id'),
});

test('should output all columns and the data type', () => {
    expectType<{
        id: string;
        createDate: Date;
        name: string;
        value: number | null;
    }>(toTableRow(foo));
})

const db = defineDb({ foo, bar }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

describe('select', () => {
    test('should return null and not null properties', () => {
        expectType<{
            id: string;
            createDate: Date;
            value: number | null;
        }>(toSnap(db.select(db.foo.id, db.foo.createDate, db.foo.value).from(db.foo)));
    });

    test('should return nullable properties of left joined columns', () => {
        expectType<{
            id: string;
            endDate: Date | null;
            value: number | null;
        }>(toSnap(db.select(db.foo.id, db.bar.endDate, db.bar.value).from(db.foo).leftJoin(db.bar)));
    });

    test('should return nullable properties of left side properties when right joining', () => {
        expectType<{
            value: number | null;
            name: string | null;
            startDate: Date;
        }>(toSnap(db.select(db.foo.name, db.bar.startDate, db.bar.value).from(db.foo).rightJoin(db.bar)));
    });

    test('should select * and return nullable properties of left side properties when right joining', () => {
        expectType<{
            id: string | null;
            createDate: Date | null;
            name: string | null;
            value: number | null;
            startDate: Date;
            endDate: Date;
            fooId: string | null;
        }>(toSnap(db.select(star()).from(db.foo).rightJoin(db.bar)));
    });

    test('should select foo.* and ignore the rest', () => {
        expectType<{
            id: string;
            createDate: Date;
            name: string;
            value: number | null;
        }>(toSnap(db.select(star(db.foo)).from(db.foo).innerJoin(db.bar)));
    });

    test('should return renamed properties because of alias', () => {
        expectType<{
            fooName: string;
            fooValue: number | null;
        }>(toSnap(db.select(db.foo.name.as(`fooName`), db.foo.value.as(`fooValue`)).from(db.foo)));
    });


    test('should return nullable properties of all sides because of full join', () => {
        expectType<{
            value: number | null;
            name: string | null;
            startDate: Date | null;
        }>(toSnap(db.select(db.foo.name, db.bar.startDate, db.bar.value).from(db.foo).fullJoin(db.bar)));
    });

    test('should select expression', () => {
        expectType<{
            "?column?": number | null;
        }>(toSnap(db.select(db.foo.value.plus(1)).from(db.foo)));
    });

    test('should select named expression', () => {
        expectType<{
            test: number | null;
        }>(toSnap(db.select(db.foo.value.plus(1).as(`test`)).from(db.foo)));
    });

    test('should select aggregate subquery', () => {
        expectType<{
            id: string;
            count: string;
        }>(toSnap(db.select(db.foo.id, db.select(count()).from(db.foo)).from(db.foo)));
    });

    test('should select array_agg', () => {
        expectType<{
            arrayAgg: string[] | null;
        }>(toSnap(db.select(arrayAgg(db.foo.name)).from(db.foo)));
    });

    test('should select null column in subquery', () => {
        expectType<{
            id: string;
            value: number | null;
        }>(toSnap(db.select(db.foo.id, db.select(db.foo.value).from(db.foo)).from(db.foo)));
    });

    test('should select aggregate with alias', () => {
        expectType<{
            id: string;
            total: number | null;
        }>(toSnap(db.select(db.foo.id, sum(db.foo.value).as(`total`)).from(db.foo)));
    });

    test('should convert null value to not null using coalesce', () => {
        expectType<{
            coalesce: number;
        }>(toSnap(db.select(coalesce(db.foo.value, 1)).from(db.foo)));
    });

    test('should select foo.* from foo', () => {
        expectType<{
            id: string;
            createDate: Date;
            name: string;
            value: number | null;
        }>(toSnap(db.select(star(db.foo)).from(db.foo)));
    });

    test('should select * from foo', () => {
        expectType<{
            id: string;
            createDate: Date;
            name: string;
            value: number | null;
        }>(toSnap(db.select(star()).from(db.foo)));
    });

    test('should select * from foo left join bar', () => {
        expectType<{
            id: string;
            createDate: Date;
            name: string;
            value: number | null;
            startDate: Date | null;
            endDate: Date | null;
            fooId: string | null;
        }>(toSnap(db.select(star()).from(db.foo).leftJoin(db.bar).on(db.bar.fooId.eq(db.foo.id))));
    });

    test('should select * from foo right join bar', () => {
        expectType<{
            id: string | null;
            createDate: Date | null;
            name: string | null;
            value: number | null;
            startDate: Date;
            endDate: Date;
            fooId: string | null;
        }>(toSnap(db.select(star()).from(db.foo).rightJoin(db.bar).on(db.bar.fooId.eq(db.foo.id))));
    });

    test('should not use in with wrong data type', () => {
        expectError(toSnap(db
            .select(db.foo.id)
            .from(db.foo)
            // @dts-jest:fail:snap should not use in with wrong data type
            .where(db.foo.id.in(db.select(db.foo.createDate).from(db.foo))),
        ));
    });

    test('with test as select from foo select * from test', async () => {
        expectType<{
            id: string;
            createDate: Date;
            name: string;
            value: number | null;
        }[]>(await db.with(`test`, db.select(db.foo.id, db.foo.createDate, db.foo.name, db.foo.value).from(db.foo), ({ test }) => db.select(test.id, test.createDate, test.name, test.value).from(test)));
    });

    test('should select case with correct type and alias', () => {
        expectType<{
            bar: 'A' | 'B' | 'C';
        }>(toSnap(db
            .select(db
                .case()
                .when(db.foo.value.gt(100))
                .then('A' as const)
                .when(db.foo.value.gt(0))
                .then('B' as const)
                .else('C' as const)
                .end()
                .as(`bar`),
            )
            .from(db.foo),
        ));
    });

    test('should select and await result set', async () => {
        expectType<{
            id: string;
            value: number | null;
        }[]>(
            await db.select(db.foo.id, db.foo.value).from(db.foo)
        );
    });

    test('should select raw expression', () => {
        expectType<{
            id: string;
            test: number | null;
        }>(
            toSnap(db.select(db.foo.id, raw<number, false, `test`>`test`).from(db.foo))
        );
    });
});
