import {
  any,
  arrayAgg,
  avg,
  bitAnd,
  bitOr,
  boolAnd,
  boolOr,
  boolean,
  count,
  defineDb,
  defineDdl,
  defineTable,
  enumType,
  every,
  exists,
  float4,
  group,
  int4,
  integer,
  max,
  min,
  notExists,
  raw,
  star,
  stringAgg,
  sum,
  text,
  timestampWithTimeZone,
  toSql,
  uuid,
} from '..';

describe(`ddl`, () => {
  const db = defineDb({}, () => Promise.resolve({ rows: [], affectedCount: 0 }));
  const ddl = defineDdl(db);

  it(`should create table`, () => {
    const query = ddl.createTable(
      `test`,
      {
        id: uuid().primaryKey().default(`gen_random_uuid()`),
        value: int4().check(`value > 0`),
        shortDescription: text().notNull(),
      },
      ddl.primaryKey(`id`),
      ddl.unique(`name`),
      ddl.check(`name <> 'Wes'`),
      ddl
        .constraint(`shouldWrapInQuotes`)
        .foreignKey(`fooId`)
        .references(`anotherTable`, `anotherId`),
    );

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "CREATE TABLE test (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), value int4 CHECK (value > 0), short_description text NOT NULL, PRIMARY KEY (id), UNIQUE (name), CHECK (name <> 'Wes'), CONSTRAINT \\"shouldWrapInQuotes\\" FOREIGN KEY (id) REFERENCES another_table (another_id))",
}
`);
  });

  it(`should alter table drop column`, () => {
    const query = ddl.alterTable(`anotherTable`).dropColumn(`shortDescription`);

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE another_table DROP COLUMN short_description",
}
`);
  });

  it(`should alter table add column`, () => {
    const query = ddl
      .alterTable(`anotherTable`)
      .addColumn(
        `shortDescription`,
        ddl.dataType(`text`).notNull().default(`"Wes"`).check(`123`).primaryKey(),
      )
      .addColumn(`test`, ddl.dataType(`int4`));

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE another_table ADD COLUMN short_description text PRIMARY KEY NOT NULL DEFAULT \\"Wes\\" CHECK (123), ADD COLUMN test int4",
}
`);
  });

  it(`should alter table rename table`, () => {
    const query = ddl.alterTable(`anotherTable`).renameTo(`anotherTable2`);

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE another_table RENAME TO another_table2",
}
`);
  });

  it(`should alter table rename column`, () => {
    const query = ddl.alterTable(`foo`).renameColumn(`shortDescription`, `longDescription`);

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo RENAME COLUMN short_description TO long_description",
}
`);
  });

  it(`should alter table alter column set not null`, () => {
    const query = ddl.alterTable(`foo`).alterColumn(`shortDescription`).setNotNull();

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo ALTER COLUMN short_description SET NOT NULL",
}
`);
  });

  it(`should alter table alter column drop not null`, () => {
    const query = ddl.alterTable(`foo`).alterColumn(`shortDescription`).dropNotNull();

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo ALTER COLUMN short_description DROP NOT NULL",
}
`);
  });

  it(`should alter table alter column set default`, () => {
    const query = ddl
      .alterTable(`foo`)
      .alterColumn(`shortDescription`)
      .setDefault(`gen_random_uuid()`);

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo ALTER COLUMN short_description SET DEFAULT gen_random_uuid()",
}
`);
  });

  it(`should alter table alter column drop default`, () => {
    const query = ddl.alterTable(`foo`).alterColumn(`shortDescription`).dropDefault();

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo ALTER COLUMN short_description DROP DEFAULT",
}
`);
  });

  it(`should alter table alter column set data type`, () => {
    const query = ddl.alterTable(`foo`).alterColumn(`shortDescription`).setDataType(`int4`);

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo ALTER COLUMN short_description SET DATA TYPE int4",
}
`);
  });

  it(`should alter table alter column set data type using`, () => {
    const query = ddl
      .alterTable(`foo`)
      .alterColumn(`shortDescription`)
      .setDataType(`int4`)
      .using(`strlen(short_description)`);

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo ALTER COLUMN short_description SET DATA TYPE int4 USING strlen(short_description)",
}
`);
  });

  it(`should alter table drop constraint`, () => {
    const query = ddl.alterTable(`foo`).dropConstraint(`test constraint`);

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo DROP CONSTRAINT \\"test constraint\\"",
}
`);
  });

  it(`should alter table add constraint primary key`, () => {
    const query = ddl.alterTable(`foo`).addConstraint(`test`).primaryKey(`anotherColumn`);

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo ADD CONSTRAINT test PRIMARY KEY (another_column)",
}
`);
  });

  it(`should alter table add constraint primary key using index`, () => {
    const query = ddl.alterTable(`foo`).addConstraint(`test`).primaryKeyUsingIndex(`some index`);

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo ADD CONSTRAINT test PRIMARY KEY USING INDEX \\"some index\\"",
}
`);
  });

  it(`should alter table add constraint unique`, () => {
    const query = ddl.alterTable(`foo`).addConstraint(`test`).unique(`shortDescription`);

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo ADD CONSTRAINT test UNIQUE (short_description)",
}
`);
  });

  it(`should alter table add constraint unique using index`, () => {
    const query = ddl.alterTable(`foo`).addConstraint(`test`).uniqueUsingIndex(`some index`);

    expect(toSql(query)).toMatchInlineSnapshot(`
Object {
  "parameters": Array [],
  "text": "ALTER TABLE foo ADD CONSTRAINT test UNIQUE USING INDEX \\"some index\\"",
}
`);
  });
});
