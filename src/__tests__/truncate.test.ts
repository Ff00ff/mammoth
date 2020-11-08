import {defineDb, defineTable, integer, text, timestampWithTimeZone, uuid} from '..';

import {toSnap} from './helpers';

describe(`truncate`, () => {
    const foo = defineTable({
        id: uuid().primaryKey().default(`gen_random_uuid()`),
        createDate: timestampWithTimeZone().notNull().default(`now()`),
        name: text().notNull(),
        value: integer(),
    });

    const bar = defineTable({
        id: uuid().primaryKey().default(`gen_random_uuid()`),
    });

    const baz = defineTable({
        id: uuid().primaryKey().default(`gen_random_uuid()`),
    });

    const db = defineDb(
        {
            foo,
            bar,
            baz,
        },
        () => Promise.resolve({rows: [], affectedCount: 0}),
    );

    it(`should truncate`, () => {
        const query = db
            .truncate(db.foo);

        expect(toSnap(query)).toMatchInlineSnapshot(`
                Object {
                  "parameters": Array [],
                  "text": "TRUNCATE foo",
                }
            `);
    });

    it(`should restart identity`, () => {
        const query = db
            .truncate(db.foo)
            .restartIdentity()

        expect(toSnap(query)).toMatchInlineSnapshot(`
                Object {
                  "parameters": Array [],
                  "text": "TRUNCATE foo RESTART IDENTITY",
                }
            `);
    })

    it(`should restart identity`, () => {
        const query = db
            .truncate(db.foo)
            .restartIdentity()

        expect(toSnap(query)).toMatchInlineSnapshot(`
                Object {
                  "parameters": Array [],
                  "text": "TRUNCATE foo RESTART IDENTITY",
                }
            `);
    })

    it(`should cascade`, () => {
        const query = db
            .truncate(db.foo)
            .cascade()

        expect(toSnap(query)).toMatchInlineSnapshot(`
                Object {
                  "parameters": Array [],
                  "text": "TRUNCATE foo CASCADE",
                }
            `);
    })
});
