import {
  CitextColumn,
  IntegerColumn,
  DecimalColumn,
  SerialColumn,
  JSONColumn,
  JSONBColumn,
  TimestampWithTimeZoneColumn,
  TimestampWithoutTimeZoneColumn,
  TimestampColumn,
  DateColumn,
  TimeColumn,
  TimeWithoutTimeZoneColumn,
  TimeWithTimeZoneColumn,
  IntervalColumn,
  MoneyColumn,
  BooleanColumn,
  ByteaColumn,
} from './../../columns';
import { Unsafe, UuidGenerateV4 } from '../..';
import { TextColumn, UuidColumn, EnumColumn } from '../../columns';
import { createDatabase } from '../../database/pool';
import { Table } from '../../table';
import { generateSql } from '../table';

const test = (clazz: any) => {
  const db = createDatabase({
    test: clazz,
  });

  return generateSql(db.test);
};

describe('generate sql', () => {
  it('should generate a simple table', () => {
    class Organization extends Table {
      id = new UuidColumn()
        .primary()
        .notNull()
        .default(new Unsafe(`uuid_generate_v4()`));
      apiKey = new TextColumn().notNull().unique();
    }

    const sql = test(new Organization());

    expect(sql).toMatchInlineSnapshot(`
                                    Array [
                                      "CREATE TABLE test (
                                      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
                                      api_key TEXT NOT NULL UNIQUE
                                    )",
                                    ]
                        `);
  });

  it('should generate a table with enum without name', () => {
    class EnumTest {
      id = new UuidColumn()
        .primaryKey()
        .notNull()
        .default(new UuidGenerateV4());
      value = new EnumColumn([`A`, `B`]).notNull();
    }

    const sql = test(new EnumTest());

    expect(sql).toMatchInlineSnapshot(`
                                    Array [
                                      "CREATE TYPE TEST_VALUE_ENUM AS ENUM ('A', 'B')",
                                      "CREATE TABLE test (
                                      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
                                      value TEST_VALUE_ENUM NOT NULL
                                    )",
                                    ]
                        `);
  });

  it('should generate a table with enum with name', () => {
    class EnumTest {
      id = new UuidColumn()
        .primaryKey()
        .notNull()
        .default(new UuidGenerateV4());
      value = new EnumColumn([`A`, `B`], `MY_ENUM`).notNull();
    }
    const sql = test(new EnumTest());

    expect(sql).toMatchInlineSnapshot(`
                                    Array [
                                      "CREATE TYPE MY_ENUM AS ENUM ('A', 'B')",
                                      "CREATE TABLE test (
                                      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
                                      value MY_ENUM NOT NULL
                                    )",
                                    ]
                        `);
  });

  it(`should create table with check`, () => {
    class Foo {
      id = new UuidColumn().primaryKey().notNull();
      bar = new TextColumn().check(`bar <> 'test'`);
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
                              Array [
                                "CREATE TABLE test (
                                id UUID PRIMARY KEY NOT NULL,
                                bar TEXT CHECK (bar <> 'test')
                              )",
                              ]
                    `);
  });

  it(`should create table with references`, () => {
    class Foo {
      id = new UuidColumn().primaryKey().notNull();
      bar = new UuidColumn().references((db: Db) => db.bar.id);
    }
    class Bar {
      id = new UuidColumn().primaryKey().notNull();
    }

    const db = createDatabase({
      foo: new Foo(),
      bar: new Bar(),
    });
    type Db = typeof db;

    const sql = generateSql(db.foo);
    expect(sql).toMatchInlineSnapshot(`
                              Array [
                                "CREATE TABLE foo (
                                id UUID PRIMARY KEY NOT NULL,
                                bar UUID REFERENCES bar (id)
                              )",
                              ]
                    `);
  });

  it(`should create table with references on update cascade`, () => {
    class Foo {
      id = new UuidColumn().primaryKey().notNull();
      bar = new UuidColumn()
        .references((db: Db) => db.bar.id)
        .onUpdate()
        .cascade();
    }
    class Bar {
      id = new UuidColumn().primaryKey().notNull();
    }

    const db = createDatabase({
      foo: new Foo(),
      bar: new Bar(),
    });
    type Db = typeof db;

    const sql = generateSql(db.foo);
    expect(sql).toMatchInlineSnapshot(`
                        Array [
                          "CREATE TABLE foo (
                          id UUID PRIMARY KEY NOT NULL,
                          bar UUID REFERENCES bar (id) ON UPDATE CASCADE
                        )",
                        ]
                `);
  });

  it(`should create table with references on update restrict`, () => {
    class Foo {
      id = new UuidColumn().primaryKey().notNull();
      bar = new UuidColumn()
        .references((db: Db) => db.bar.id)
        .onUpdate()
        .restrict();
    }
    class Bar {
      id = new UuidColumn().primaryKey().notNull();
    }

    const db = createDatabase({
      foo: new Foo(),
      bar: new Bar(),
    });
    type Db = typeof db;

    const sql = generateSql(db.foo);
    expect(sql).toMatchInlineSnapshot(`
                        Array [
                          "CREATE TABLE foo (
                          id UUID PRIMARY KEY NOT NULL,
                          bar UUID REFERENCES bar (id) ON UPDATE RESTRICT
                        )",
                        ]
                `);
  });

  it(`should create table with references on delete cascade`, () => {
    class Foo {
      id = new UuidColumn().primaryKey().notNull();
      bar = new UuidColumn()
        .references((db: Db) => db.bar.id)
        .onDelete()
        .cascade();
    }
    class Bar {
      id = new UuidColumn().primaryKey().notNull();
    }

    const db = createDatabase({
      foo: new Foo(),
      bar: new Bar(),
    });
    type Db = typeof db;

    const sql = generateSql(db.foo);
    expect(sql).toMatchInlineSnapshot(`
                        Array [
                          "CREATE TABLE foo (
                          id UUID PRIMARY KEY NOT NULL,
                          bar UUID REFERENCES bar (id) ON DELETE CASCADE
                        )",
                        ]
                `);
  });

  it(`should create table with references on delete restrict`, () => {
    class Foo {
      id = new UuidColumn().primaryKey().notNull();
      bar = new UuidColumn()
        .references((db: Db) => db.bar.id)
        .onDelete()
        .restrict();
    }
    class Bar {
      id = new UuidColumn().primaryKey().notNull();
    }

    const db = createDatabase({
      foo: new Foo(),
      bar: new Bar(),
    });
    type Db = typeof db;

    const sql = generateSql(db.foo);
    expect(sql).toMatchInlineSnapshot(`
                        Array [
                          "CREATE TABLE foo (
                          id UUID PRIMARY KEY NOT NULL,
                          bar UUID REFERENCES bar (id) ON DELETE RESTRICT
                        )",
                        ]
                `);
  });

  it(`should create table with citext`, () => {
    class Foo {
      val = new CitextColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
                  Array [
                    "CREATE TABLE test (
                    val CITEXT
                  )",
                  ]
            `);
  });

  it(`should create table with integer column`, () => {
    class Foo {
      val = new IntegerColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val INTEGER
            )",
            ]
        `);
  });

  it(`should create table with decimal column`, () => {
    class Foo {
      val = new DecimalColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val DECIMAL
            )",
            ]
        `);
  });

  it(`should create table with serial column`, () => {
    class Foo {
      val = new SerialColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val SERIAL
            )",
            ]
        `);
  });

  it(`should create table with JSON column`, () => {
    class Foo {
      val = new JSONColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val JSON
            )",
            ]
        `);
  });

  it(`should create table with JSONB column`, () => {
    class Foo {
      val = new JSONBColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val JSONB
            )",
            ]
        `);
  });

  it(`should create table with TimestampWithTimeZone column`, () => {
    class Foo {
      val = new TimestampWithTimeZoneColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val TIMESTAMP WITH TIME ZONE
            )",
            ]
        `);
  });

  it(`should create table with TimestampWithoutTimeZone column`, () => {
    class Foo {
      val = new TimestampWithoutTimeZoneColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val TIMESTAMP WITHOUT TIME ZONE
            )",
            ]
        `);
  });

  it(`should create table with timestamp column`, () => {
    class Foo {
      val = new TimestampColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val TIMESTAMP
            )",
            ]
        `);
  });

  it(`should create table with date column`, () => {
    class Foo {
      val = new DateColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val DATE
            )",
            ]
        `);
  });

  it(`should create table with time column`, () => {
    class Foo {
      val = new TimeColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val TIME
            )",
            ]
        `);
  });

  it(`should create table with time with time zone column`, () => {
    class Foo {
      val = new TimeWithTimeZoneColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val TIME WITH TIME ZONE
            )",
            ]
        `);
  });

  it(`should create table with time without time zone column`, () => {
    class Foo {
      val = new TimeWithoutTimeZoneColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val TIME WITHOUT TIME ZONE
            )",
            ]
        `);
  });

  it(`should create table with interval column`, () => {
    class Foo {
      val = new IntervalColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val INTERVAL
            )",
            ]
        `);
  });

  it(`should create table with money column`, () => {
    class Foo {
      val = new MoneyColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val MONEY
            )",
            ]
        `);
  });

  it(`should create table with boolean column`, () => {
    class Foo {
      val = new BooleanColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
            Array [
              "CREATE TABLE test (
              val BOOLEAN
            )",
            ]
        `);
  });

  it(`should create table with bytea column`, () => {
    class Foo {
      val = new ByteaColumn();
    }
    const sql = test(new Foo());
    expect(sql).toMatchInlineSnapshot(`
      Array [
        "CREATE TABLE test (
        val BYTEA
      )",
      ]
    `);
  });
});
