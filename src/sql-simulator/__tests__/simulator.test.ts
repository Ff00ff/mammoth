import { cloneDeep } from 'lodash';
import Simulator, { TableMap, TypeMap } from '..';

describe(`Simulator`, () => {
  let simulator: Simulator;

  beforeEach(() => {
    simulator = new Simulator();
  });

  describe(`CREATE TYPE`, () => {
    const simulate = (query: string, types: TypeMap, initialTypes: TypeMap = {}) => {
      simulator.types = initialTypes;
      simulator.simulateQuery(query);

      expect(simulator.types).toEqual(types);
    }

    it(`should create enumerated type`, () => {
      const query = `CREATE TYPE test AS ENUM ('a', 'b,', 'c')`;
      const types: TypeMap = {
        test: {
          name: `test`,
          type: `enum`,
          labels: [
            `a`,
            `b,`,
            `c`,
          ],
        },
      };

      simulate(query, types);
    });

    it(`should create enumerated type with escape character`, () => {
      const query = `CREATE TYPE test AS ENUM ('a', 'b\\'', 'c')`;
      const types: TypeMap = {
        test: {
          name: `test`,
          type: `enum`,
          labels: [
            `a`,
            `b\\'`,
            `c`,
          ],
        },
      };

      simulate(query, types);
    });

    it(`should drop enumerated type`, () => {
      const query = `DROP TYPE test`;
      const types: TypeMap = {
        test: {
          name: `test`,
          type: `enum`,
          labels: [
            `a`,
            `b`,
            `c`,
          ],
        },
      };

      simulate(query, {}, types);
    });
  });

  describe(`ALTER TYPE`, () => {
    const simulate = (query: string, types: TypeMap) => {
      simulator.types = {
        test: {
          name: `test`,
          type: `enum`,
          labels: [
            `a`,
            `b`,
            `c`,
          ],
        },
      };
      simulator.simulateQuery(query);

      expect(simulator.types).toEqual(types);
    }

    it(`should add value at the back`, () => {
      const query = `ALTER TYPE test ADD VALUE 'd' AFTER 'c'`;
      const types: TypeMap = {
        test: {
          name: `test`,
          type: `enum`,
          labels: [
            `a`,
            `b`,
            `c`,
            `d`,
          ],
        }
      }
      simulate(query, types);
    });

    it(`should add value in the front`, () => {
      const query = `ALTER TYPE test ADD VALUE 'd' BEFORE 'a'`;
      const types: TypeMap = {
        test: {
          name: `test`,
          type: `enum`,
          labels: [
            `d`,
            `a`,
            `b`,
            `c`,
          ]
        }
      }
      simulate(query, types);
    });

    it(`should add value in the middle`, () => {
      const query = `ALTER TYPE test ADD VALUE 'd' AFTER 'b'`;
      const types: TypeMap = {
        test: {
          name: `test`,
          type: `enum`,
          labels: [
            `a`,
            `b`,
            `d`,
            `c`,
          ],
        }
      }
      simulate(query, types);
    });
  });

  describe(`CREATE TABLE`, () => {
    const simulate = (query: string, tables: TableMap, initialTables: TableMap = {}) => {
      simulator.tables = initialTables;
      simulator.simulateQuery(query);

      expect(simulator.tables).toEqual(tables);
    }

    it(`should create basic table with different data types`, () => {
      const query = `CREATE TABLE account (
        id INTEGER,
        first_name TEXT,
        last_name MySpecialType
      )`;
      const tables: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
                dataType: `INTEGER`,
                name: `id`,
                modifiers: {},
            },
            first_name: {
                dataType: `TEXT`,
                name: `first_name`,
                modifiers: {},
            },
            last_name: {
                dataType: `MySpecialType`,
                name: `last_name`,
                modifiers: {},
            },
          },
          indexes: [],
        },
      };

      simulate(query, tables);
    });

    it(`should create table with PRIMARY KEY`, () => {
      const query = `CREATE TABLE account (
        id INTEGER PRIMARY KEY
      )`;
      const tables: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [{
            type: `primaryKey`,
            name: `account_pkey`,
            columns: [
              `id`,
            ],
          }]
        },
      };

      simulate(query, tables);
    });

    it(`should create table with NOT NULL`, () => {
      const query = `CREATE TABLE account (
        id INTEGER NOT NULL
      )`;
      const tables: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {
                notNull: true,
              },
            },
          },
          indexes: [],
        },
      };

      simulate(query, tables);
    });

    describe(`getInScope`, () => {
      const testScope = (testString: string) => {
        it(testString, () => {
          simulator.input = `(${testString})`;
          simulator.scope(() => {
            const inScope = simulator.getInScope();

            expect(inScope).toEqual(testString);
            return undefined;
          });
        });
      }

      testScope(`value > 0`);
      testScope(`value + (123 / 2) < 0`);
      testScope(`value + "te)st"`);
      testScope(`value + "'"`);
      testScope(`value + "\`"`);
      testScope(`value + "\`"`);
      testScope(`value \\)`);
    });

    it(`should create table with CHECK`, () => {
      const query = `CREATE TABLE account (
        id INTEGER CHECK (id > 0)
      )`;
      const tables: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [{
            type: `check`,
            name: `account_id_check`,
            expression: `id > 0`,
            columns: [
              `id`,
            ],
          }],
        },
      };

      simulate(query, tables);
    });

    it(`should create table with DEFAULT NOW()`, () => {
      const query = `CREATE TABLE account (
        id TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      )`;
      const tables: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `TIMESTAMP WITHOUT TIME ZONE`,
              name: `id`,
              modifiers: {
                default: `NOW()`,
              },
            },
          },
          indexes: [],
        },
      };

      simulate(query, tables);
    });

    it(`should create table with DEFAULT uuid_generate_v4() and primary key`, () => {
      const query = `CREATE TABLE account (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY
      )`;
      const tables: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `UUID`,
              name: `id`,
              modifiers: {
                default: `uuid_generate_v4()`,
              },
            },
          },
          indexes: [{
            type: `primaryKey`,
            name: `account_pkey`,
            columns: [
              `id`,
            ],
          }],
        },
      };

      simulate(query, tables);
    });

    it(`should create table with DEFAULT 1`, () => {
      const query = `CREATE TABLE account (
        id TIMESTAMP WITHOUT TIME ZONE DEFAULT 1
      )`;
      const tables: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `TIMESTAMP WITHOUT TIME ZONE`,
              name: `id`,
              modifiers: {
                default: `1`,
              },
            },
          },
          indexes: [],
        },
      };

      simulate(query, tables);
    });

    it(`should create table with DEFAULT "test"`, () => {
      const query = `CREATE TABLE account (
        id TIMESTAMP WITHOUT TIME ZONE DEFAULT "test"
      )`;
      const tables: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `TIMESTAMP WITHOUT TIME ZONE`,
              name: `id`,
              modifiers: {
                default: `"test"`,
              },
            },
          },
          indexes: [],
        },
      };

      simulate(query, tables);
    });

    it(`should create table with DEFAULT "test"`, () => {
      const query = `CREATE TABLE account (
        id TIMESTAMP WITHOUT TIME ZONE DEFAULT "test"
      )`;
      const tables: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `TIMESTAMP WITHOUT TIME ZONE`,
              name: `id`,
              modifiers: {
                default: `"test"`,
              },
            },
          },
          indexes: [],
        },
      };

      simulate(query, tables);
    });

    it(`should create table with column with foreign key constraint`, () => {
      const query = `CREATE TABLE account (
        test_id INTEGER REFERENCES test (id)
      )`;

      const tables: TableMap = {
        account: {
          name: `account`,
          columns: {
            test_id: {
              dataType: `INTEGER`,
              name: `test_id`,
              modifiers: {},
            },
          },
          indexes: [{
            type: `foreignKey`,
            name: `account_test_id_fkey`,
            tableName: `test`,
            columns: [
              `test_id`,
            ],
            referenceColumns: [
              `id`,
            ],
          }],
        },
      };

      simulate(query, tables);
    });

    it(`should create table with column with multiple columns and a foreign key constraint`, () => {
      const query = `CREATE TABLE account_token (
        account_id INTEGER NOT NULL REFERENCES account (id),
        local_token TEXT NOT NULL
      )`;

      const tables: TableMap = {
        account_token: {
          name: `account_token`,
          columns: {
            account_id: {
              dataType: `INTEGER`,
              name: `account_id`,
              modifiers: {
                notNull: true,
              },
            },
            local_token: {
              dataType: `TEXT`,
              name: `local_token`,
              modifiers: {
                notNull: true,
              },
            },
          },
          indexes: [{
            type: `foreignKey`,
            name: `account_token_account_id_fkey`,
            columns: [
              `account_id`,
            ],
            referenceColumns: [
              `id`,
            ],
            tableName: `account`,
          }],
        },
      };

      simulate(query, tables);
    });

    it(`should set unique constraint`, () => {
      const query = `CREATE TABLE test (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE
      )`;
      const tables: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
            name: {
              name: `name`,
              dataType: `TEXT`,
              modifiers: {},
            },
          },
          indexes: [{
            type: `primaryKey`,
            name: `test_pkey`,
            columns: [
              `id`,
            ],
          }, {
            type: `unique`,
            name: `test_name_key`,
            columns: [
              `name`,
            ],
          }],
        }
      };

      simulate(query, tables);
    });

    it(`should set primary key as first constraint`, () => {
      const query = `CREATE TABLE test (
        name TEXT UNIQUE,
        id INTEGER PRIMARY KEY
      )`;
      const tables: TableMap = {
        test: {
          name: `test`,
          columns: {
            name: {
              name: `name`,
              dataType: `TEXT`,
              modifiers: {},
            },
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [{
            type: `primaryKey`,
            name: `test_pkey`,
            columns: [
              `id`,
            ],
          }, {
            type: `unique`,
            name: `test_name_key`,
            columns: [
              `name`,
            ],
          }],
        }
      };

      simulate(query, tables);
    });

    it(`create multi-column primary key`, () => {
      const query = `CREATE TABLE test (
        id INTEGER,
        name TEXT,
        PRIMARY KEY (id, name)
      )`;
      const tables: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
            name: {
              name: `name`,
              dataType: `TEXT`,
              modifiers: {},
            },
          },
          indexes: [{
            type: `primaryKey`,
            name: `test_id_name_pkey`,
            columns: [
              `id`,
              `name`,
            ],
          }],
        }
      };

      simulate(query, tables);
    });

    it(`create multi-column unique`, () => {
      const query = `CREATE TABLE test (
        id INTEGER,
        name TEXT,
        UNIQUE (id, name)
      )`;
      const tables: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              modifiers: {},
              dataType: `INTEGER`,
            },
            name: {
              name: `name`,
              modifiers: {},
              dataType: `TEXT`,
            },
          },
          indexes: [{
            type: `unique`,
            name: `test_id_name_key`,
            columns: [
              `id`,
              `name`,
            ],
          }],
        }
      };

      simulate(query, tables);
    });

    it(`create multi-column foreign key`, () => {
      const query = `CREATE TABLE test (
        foo_id INTEGER,
        bar_id INTEGER,
        FOREIGN KEY (foo_id, bar_id) REFERENCES foo (id, bar_id)
      )`;
      const tables: TableMap = {
        test: {
          name: `test`,
          columns: {
            foo_id: {
              name: `foo_id`,
              modifiers: {},
              dataType: `INTEGER`,
            },
            bar_id: {
              name: `bar_id`,
              modifiers: {},
              dataType: `INTEGER`,
            },
          },
          indexes: [{
            type: `foreignKey`,
            name: `test_foo_id_bar_id_fkey`,
            columns: [
              `foo_id`,
              `bar_id`,
            ],
            referenceColumns: [
              `id`,
              `bar_id`,
            ],
            tableName: `foo`,
          }],
        },
        foo: {
          name: `foo`,
          columns: {
            id: {
              name: `id`,
              modifiers: {},
              dataType: `INTEGER`,
            },
            bar_id: {
              name: `bar_id`,
              modifiers: {},
              dataType: `INTEGER`,
            },
          },
          indexes: [],
        },
      };
      const initialTables: TableMap = {
        foo: {
          name: `foo`,
          columns: {
            id: {
              name: `id`,
              modifiers: {},
              dataType: `INTEGER`,
            },
            bar_id: {
              name: `bar_id`,
              modifiers: {},
              dataType: `INTEGER`,
            },
          },
          indexes: [],
        },
      };

      simulate(query, tables, initialTables);
    });

    it(`create references without column name`, () => {
      // From the docs: "because in absence of a column list the primary key of the referenced
      // table is used as the referenced column(s)."
      const query = `CREATE TABLE test (
        foo_id INTEGER REFERENCES foo
      )`;
      const initialTables: TableMap = {
        foo: {
          name: `foo`,
          columns: {
            id: {
              name: `id`,
              modifiers: {},
              dataType: `INTEGER`,
            },
          },
          indexes: [{
            type: `primaryKey`,
            name: `foo_pkey`,
            columns: [
              `id`,
            ],
          }],
        },
      };
      const tables: TableMap = {
        test: {
          name: `test`,
          columns: {
            foo_id: {
              name: `foo_id`,
              modifiers: {},
              dataType: `INTEGER`,
            },
          },
          indexes: [{
            type: `foreignKey`,
            name: `test_foo_id_fkey`,
            tableName: `foo`,
            columns: [
              `foo_id`,
            ],
            referenceColumns: [],
          }],
        },
        ...initialTables,
      };

      simulate(query, tables, initialTables);
    });

    // TODO: Also check the name of foreign key/index/etc.
  });

  describe(`ALTER TABLE`, () => {
    const simulate = (tables: TableMap, query: string, result: TableMap) => {
      simulator.tables = tables;
      simulator.simulateQuery(query);

      expect(simulator.tables).toEqual(result);
    }

    it(`should drop table`, () => {
      const before: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };

      const query = `DROP TABLE account`;

      simulate(before, query, {});
    });

    it(`should drop column`, () => {
      const before: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };

      const query = `ALTER TABLE account DROP COLUMN id`;

      const after = cloneDeep(before);
      delete after.account!.columns.id;

      simulate(before, query, after);
    });

    it(`should add column with not null`, () => {
      const before: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };

      const query = `ALTER TABLE account ADD COLUMN name TEXT NOT NULL`;

      const after = cloneDeep(before);
      after.account!.columns.name = {
        dataType: `TEXT`,
        name: `name`,
        modifiers: {
          notNull: true,
        },
      };

      simulate(before, query, after);
    });

    it(`should add column with default "test"`, () => {
      const before: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };

      const query = `ALTER TABLE account ADD COLUMN name TEXT DEFAULT "test"`;

      const after = cloneDeep(before);
      after.account!.columns.name = {
        dataType: `TEXT`,
        name: `name`,
        modifiers: {
          default: `"test"`,
        },
      };

      simulate(before, query, after);
    });

    it(`should alter column [set data] type`, () => {
      const before: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };

      const query = `ALTER TABLE account ALTER COLUMN id TYPE SERIAL`;

      const after = cloneDeep(before);
      after.account!.columns.id!.dataType = `SERIAL`;

      simulate(before, query, after);
    });

    it(`should alter column set data type`, () => {
      const before: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };

      const query = `ALTER TABLE account ALTER COLUMN id SET DATA TYPE SERIAL`;

      const after = cloneDeep(before);
      after.account!.columns.id!.dataType = `SERIAL`;

      simulate(before, query, after);
    });

    it(`should alter column set default 123`, () => {
      const before: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };

      const query = `ALTER TABLE account ALTER COLUMN id SET DEFAULT 123`;

      const after = cloneDeep(before);
      after.account!.columns.id!.modifiers = {
        default: `123`,
      };

      simulate(before, query, after);
    });

    it(`should alter column drop default`, () => {
      const before: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {
                default: `123`,
              },
            },
          },
          indexes: [],
        },
      };

      const query = `ALTER TABLE account ALTER COLUMN id DROP DEFAULT`;

      const after = cloneDeep(before);
      after.account!.columns.id!.modifiers = {};

      simulate(before, query, after);
    });

    it(`should alter column set not null`, () => {
      const before: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };

      const query = `ALTER TABLE account ALTER COLUMN id SET NOT NULL`;

      const after = cloneDeep(before);
      after.account!.columns.id!.modifiers = {
        notNull: true,
      };

      simulate(before, query, after);
    });

    it(`should alter column drop not null`, () => {
      const before: TableMap = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {
                notNull: true,
              },
            },
          },
          indexes: [],
        },
      };

      const query = `ALTER TABLE account ALTER COLUMN id DROP NOT NULL`;

      const after = cloneDeep(before);
      after.account!.columns.id!.modifiers = {};

      simulate(before, query, after);
    });

    it(`should rename column`, () => {
      const before = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };

      const query = `ALTER TABLE account RENAME COLUMN id TO test`;

      const after = cloneDeep(before);
      after.account.columns.id.name = `test`;
      (after.account.columns as any).test = after.account.columns.id;
      delete after.account.columns.id;

      simulate(before, query, after);
    });

    it(`should set default and not null`, () => {
      const before = {
        account: {
          name: `account`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };

      const query = `ALTER TABLE account ALTER COLUMN id SET NOT NULL, ALTER COLUMN id SET DEFAULT 123`;

      const after = cloneDeep(before);
      after.account.columns.id.modifiers = {
        notNull: true,
        default: `123`,
      };

      simulate(before, query, after);
    });

    it(`should alter table add column`, () => {
      const before = {
        test: {
          name: `test`,
          columns: {
            id: {
              dataType: `INTEGER`,
              name: `id`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const query = `ALTER TABLE test ADD COLUMN value TEXT`;
      const after = cloneDeep(before);
      (after.test.columns as any).value = {
        dataType: `TEXT`,
        name: `value`,
        modifiers: {},
      };

      simulate(before, query, after);
    });
  });
});
