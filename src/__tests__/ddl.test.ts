import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '..';

import { table } from 'console';
import { toSnap } from './helpers';

describe(`ddl`, () => {
  const foo = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const db = defineDb(
    {
      foo,
    },
    () => Promise.resolve({ rows: [], affectedCount: 0 }),
  );

  it(`should retrieve column definition info`, () => {
    const tableDefinitions = db.getTableDefinitions();

    expect(tableDefinitions).toMatchInlineSnapshot(`
      Array [
        Object {
          "columns": Array [
            Object {
              "checkExpression": undefined,
              "dataType": "uuid",
              "defaultExpression": "gen_random_uuid()",
              "isNotNull": false,
              "isPrimaryKey": true,
              "isUnique": false,
              "name": "id",
              "referencesColumn": undefined,
              "referencesTable": undefined,
            },
            Object {
              "checkExpression": undefined,
              "dataType": "timestamp with time zone",
              "defaultExpression": "now()",
              "isNotNull": true,
              "isPrimaryKey": false,
              "isUnique": false,
              "name": "createDate",
              "referencesColumn": undefined,
              "referencesTable": undefined,
            },
            Object {
              "checkExpression": undefined,
              "dataType": "text",
              "defaultExpression": undefined,
              "isNotNull": true,
              "isPrimaryKey": false,
              "isUnique": false,
              "name": "name",
              "referencesColumn": undefined,
              "referencesTable": undefined,
            },
            Object {
              "checkExpression": undefined,
              "dataType": "integer",
              "defaultExpression": undefined,
              "isNotNull": false,
              "isPrimaryKey": false,
              "isUnique": false,
              "name": "value",
              "referencesColumn": undefined,
              "referencesTable": undefined,
            },
          ],
          "name": "foo",
        },
      ]
    `);
  });
});
