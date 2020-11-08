import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '..';

import { enumType } from '../data-types';
import { table } from 'console';
import { toSnap } from './helpers';

describe(`ddl`, () => {
  const foo = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
    enumTest: enumType('my_enum_type', ['A', 'B', 'C']),
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
              "enumValues": undefined,
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
              "enumValues": undefined,
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
              "enumValues": undefined,
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
              "enumValues": undefined,
              "isNotNull": false,
              "isPrimaryKey": false,
              "isUnique": false,
              "name": "value",
              "referencesColumn": undefined,
              "referencesTable": undefined,
            },
            Object {
              "checkExpression": undefined,
              "dataType": "my_enum_type",
              "defaultExpression": undefined,
              "enumValues": Array [
                "A",
                "B",
                "C",
              ],
              "isNotNull": false,
              "isPrimaryKey": false,
              "isUnique": false,
              "name": "enumTest",
              "referencesColumn": undefined,
              "referencesTable": undefined,
            },
          ],
          "name": "foo",
          "originalDefinition": Object {
            "createDate": Object {
              "check": [Function],
              "default": [Function],
              "getDefinition": [Function],
              "notNull": [Function],
              "primaryKey": [Function],
              "references": [Function],
              "unique": [Function],
            },
            "enumTest": Object {
              "check": [Function],
              "default": [Function],
              "getDefinition": [Function],
              "notNull": [Function],
              "primaryKey": [Function],
              "references": [Function],
              "unique": [Function],
            },
            "id": Object {
              "check": [Function],
              "default": [Function],
              "getDefinition": [Function],
              "notNull": [Function],
              "primaryKey": [Function],
              "references": [Function],
              "unique": [Function],
            },
            "name": Object {
              "check": [Function],
              "default": [Function],
              "getDefinition": [Function],
              "notNull": [Function],
              "primaryKey": [Function],
              "references": [Function],
              "unique": [Function],
            },
            "value": Object {
              "check": [Function],
              "default": [Function],
              "getDefinition": [Function],
              "notNull": [Function],
              "primaryKey": [Function],
              "references": [Function],
              "unique": [Function],
            },
          },
        },
      ]
    `);
  });
});
