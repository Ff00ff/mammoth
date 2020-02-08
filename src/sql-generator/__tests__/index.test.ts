import { generateSql } from '..';

describe('generate sql', () => {
  it('should generate a simple table', () => {
    const sql = generateSql({
      name: `test`,
      columns: [
        {
          snakeCaseName: `id`,
          dataType: `UUID`,
          config: {
            primary: true,
            notNull: true,
            default: `uuid_generate_v4()`,
          },
        },
        {
          snakeCaseName: `api_key`,
          dataType: `TEXT`,
          config: {
            notNull: true,
            unique: true,
          },
        },
      ],
    });

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
    const sql = generateSql({
      name: `test`,
      columns: [
        {
          snakeCaseName: `id`,
          dataType: `UUID`,
          config: {
            primary: true,
            notNull: true,
            default: `uuid_generate_v4()`,
          },
        },
        {
          snakeCaseName: `value`,
          dataType: undefined,
          enumValues: [`A`, `B`],
          config: {
            notNull: true,
          },
        },
      ],
    });

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
    const sql = generateSql({
      name: `test`,
      columns: [
        {
          snakeCaseName: `id`,
          dataType: `UUID`,
          config: {
            primary: true,
            notNull: true,
            default: `uuid_generate_v4()`,
          },
        },
        {
          snakeCaseName: `value`,
          dataType: `MY_ENUM`,
          enumValues: [`A`, `B`],
          config: {
            notNull: true,
          },
        },
      ],
    });

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
    const sql = generateSql({
      name: `test`,
      columns: [
        {
          snakeCaseName: `id`,
          dataType: `UUID`,
          config: {
            primary: true,
            notNull: true,
          },
        },
        {
          snakeCaseName: `bar`,
          dataType: `TEXT`,
          config: {
            check: `bar <> 'test'`,
          },
        },
      ],
    });
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
    const sql = generateSql({
      name: `foo`,
      columns: [
        {
          snakeCaseName: `id`,
          dataType: `UUID`,
          config: {
            primary: true,
            notNull: true,
          },
        },
        {
          snakeCaseName: `bar`,
          dataType: `UUID`,
          config: {
            references: {
              columnName: `id`,
              tableName: `bar`,
            },
          },
        },
      ],
    });
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
    const sql = generateSql({
      name: `foo`,
      columns: [
        {
          snakeCaseName: `id`,
          dataType: `UUID`,
          config: {
            primary: true,
            notNull: true,
          },
        },
        {
          snakeCaseName: `bar`,
          dataType: `UUID`,
          config: {
            references: {
              columnName: `id`,
              tableName: `bar`,
            },
            onUpdate: `cascade`,
          },
        },
      ],
    });
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
    const sql = generateSql({
      name: `foo`,
      columns: [
        {
          snakeCaseName: `id`,
          dataType: `UUID`,
          config: {
            primary: true,
            notNull: true,
          },
        },
        {
          snakeCaseName: `bar`,
          dataType: `UUID`,
          config: {
            references: {
              columnName: `id`,
              tableName: `bar`,
            },
            onUpdate: `restrict`,
          },
        },
      ],
    });
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
    const sql = generateSql({
      name: `foo`,
      columns: [
        {
          snakeCaseName: `id`,
          dataType: `UUID`,
          config: {
            primary: true,
            notNull: true,
          },
        },
        {
          snakeCaseName: `bar`,
          dataType: `UUID`,
          config: {
            references: {
              columnName: `id`,
              tableName: `bar`,
            },
            onDelete: `cascade`,
          },
        },
      ],
    });
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
    const sql = generateSql({
      name: `foo`,
      columns: [
        {
          snakeCaseName: `id`,
          dataType: `UUID`,
          config: {
            primary: true,
            notNull: true,
          },
        },
        {
          snakeCaseName: `bar`,
          dataType: `UUID`,
          config: {
            references: {
              columnName: `id`,
              tableName: `bar`,
            },
            onDelete: `restrict`,
          },
        },
      ],
    });
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
    const sql = generateSql({
      name: `test`,
      columns: [
        {
          snakeCaseName: `val`,
          dataType: `CITEXT`,
          config: {
            //
          },
        },
      ],
    });
    expect(sql).toMatchInlineSnapshot(`
                  Array [
                    "CREATE TABLE test (
                    val CITEXT
                  )",
                  ]
            `);
  });
});
