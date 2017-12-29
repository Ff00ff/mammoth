import { cloneDeep } from 'lodash';
import { createSql } from '..';
import Simulator, { TableMap, TypeMap } from '../../sql-simulator';

describe(`creator`, () => {
  describe(`type`, () => {
    const create = (from: TypeMap, to: TypeMap) => {
      const fromSimulator = new Simulator();
      fromSimulator.types = from;

      const toSimulator = new Simulator();
      toSimulator.types = to;

      return createSql(fromSimulator, toSimulator);
    }

    it(`should create type`, () => {
      const from: TypeMap = {};
      const to: TypeMap = {
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

      const queries = create(from, to);
      expect(queries).toEqual([
        `CREATE TYPE test AS ENUM ('a', 'b', 'c')`,
      ]);
    });

    it(`should drop type`, () => {
      const from: TypeMap = {
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
      const to: TypeMap = {};

      const queries = create(from, to);
      expect(queries).toEqual([
        `DROP TYPE test`,
      ]);
    });

    it(`should add value in the back`, () => {
      const from: TypeMap = {
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
      const to = cloneDeep(from);
      to.test!.labels.push(`d`);

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TYPE test ADD VALUE 'd' AFTER 'c'`,
      ]);
    });

    it(`should add value at the front`, () => {
      const from: TypeMap = {
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
      const to = cloneDeep(from);
      to.test!.labels.splice(0, 0, `d`);

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TYPE test ADD VALUE 'd' BEFORE 'a'`,
      ]);
    });

    it(`should add value in the middle`, () => {
      const from: TypeMap = {
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
      const to = cloneDeep(from);
      to.test!.labels.splice(2, 0, `d`);

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TYPE test ADD VALUE 'd' AFTER 'b'`,
      ]);
    });

    it(`should add multiple values`, () => {
      const from: TypeMap = {
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
      const to = cloneDeep(from);
      to.test!.labels.splice(0, 0, `d`);
      to.test!.labels.splice(2, 0, `e`);
      to.test!.labels.splice(5, 0, `f`);

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TYPE test ADD VALUE 'd' BEFORE 'a'`,
        `ALTER TYPE test ADD VALUE 'e' AFTER 'a'`,
        `ALTER TYPE test ADD VALUE 'f' AFTER 'c'`,
      ]);
    });

    it(`cannot drop value`, () => {
      // TODO: You cannot drop a value. You must drop the type and re-create the type without the value. Is this something we want to do automatically?
    });
  });

  describe(`table`, () => {
    const create = (from: TableMap, to: TableMap) => {
      const fromSimulator = new Simulator();
      fromSimulator.tables = from;

      const toSimulator = new Simulator();
      toSimulator.tables = to;

      return createSql(fromSimulator, toSimulator);
    }

    it(`should add column`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.columns.value = {
        name: `value`,
        dataType: `TEXT`,
        modifiers: {},
      };

      const queries = create(from, to);

      expect(queries).toEqual([
        `ALTER TABLE test ADD COLUMN value TEXT`,
      ]);
    });

    it(`should drop column`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
            value: {
              name: `value`,
              dataType: `TEXT`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      delete to.test!.columns.value;

      const queries = create(from, to);

      expect(queries).toEqual([
        `ALTER TABLE test DROP COLUMN value`,
      ]);
    });

    it(`should rename column`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
            value: {
              name: `value`,
              dataType: `TEXT`,
              modifiers: {
                notNull: true,
              }
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.columns.test = to.test!.columns.value;
      to.test!.columns.test!.name = `test`;
      delete to.test!.columns.value;

      const queries = create(from, to);

      expect(queries).toEqual([
        `ALTER TABLE test RENAME COLUMN value TO test`,
      ]);
    });

    it(`should add table`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.account = {
        name: `account`,
        columns: {
          id: {
            name: `id`,
            dataType: `UUID`,
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
      };

      const queries = create(from, to);

      expect(queries).toEqual([
        `CREATE TABLE account (\n\tid UUID DEFAULT uuid_generate_v4() PRIMARY KEY\n)`,
      ]);
    });

    it(`should drop table`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = {};

      const queries = create(from, to);

      expect(queries).toEqual([
        `DROP TABLE test`,
      ]);
    });

    it(`should rename table`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.name = `test2`;
      to.test2 = to.test;
      delete to.test;

      const queries = create(from, to);

      expect(queries).toEqual([
        `ALTER TABLE test RENAME TO test2`,
      ]);
    });

    it(`should set default`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.columns.id!.modifiers.default = `1`;

      const queries = create(from, to);

      expect(queries).toEqual([
        `ALTER TABLE test ALTER COLUMN id SET DEFAULT 1`,
      ]);
    });

    it(`should drop default`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {
                default: `1`,
              },
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      delete to.test!.columns.id!.modifiers.default;

      const queries = create(from, to);

      expect(queries).toEqual([
        `ALTER TABLE test ALTER COLUMN id DROP DEFAULT`,
      ]);
    });

    it(`should set not null`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.columns.id!.modifiers.notNull = true;

      const queries = create(from, to);

      expect(queries).toEqual([
        `ALTER TABLE test ALTER COLUMN id SET NOT NULL`,
      ]);
    });

    it(`should drop not null`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {
                notNull: true,
              },
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      delete to.test!.columns.id!.modifiers.notNull;

      const queries = create(from, to);

      expect(queries).toEqual([
        `ALTER TABLE test ALTER COLUMN id DROP NOT NULL`,
      ]);
    });

    it(`should change data type`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.columns.id!.dataType = `TEXT`

      const queries = create(from, to);

      expect(queries).toEqual([
        `ALTER TABLE test ALTER COLUMN id SET DATA TYPE TEXT`,
      ]);
    });

    it(`should add check constraint`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [{
        type: `check`,
        name: `test_id_check`,
        columns: [],
        expression: `id > 0`,
      }]

      const queries = create(from, to);

      expect(queries).toEqual([
        `ALTER TABLE test ADD CONSTRAINT test_id_check CHECK (id > 0)`,
      ]);
    });

    it(`should drop check from column`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [{
            type: `check`,
            name: `test_id_check`,
            columns: [
              `id`,
            ],
            expression: `id > 0`,
          }],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [];

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test DROP CONSTRAINT test_id_check`,
      ]);
    });

    it(`should drop check from table indexes`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [{
            type: `check`,
            name: `some_constraint_checker`,
            expression: `id > 0`,
            columns: [],
          }],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [];

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test DROP CONSTRAINT some_constraint_checker`,
      ]);
    });

    it(`should alter check`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [{
            type: `check`,
            name: `some_constraint_checker`,
            expression: `id > 0`,
            columns: [],
          }],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes[0].expression = `id > 1`;

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test DROP CONSTRAINT some_constraint_checker`,
        `ALTER TABLE test ADD CONSTRAINT some_constraint_checker CHECK (id > 1)`,
      ]);
    });

    it(`should add references`, () => {
      const from: TableMap = {
        foo: {
          name: `foo`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
        test: {
          name: `test`,
          columns: {
            foo_id: {
              name: `foo_id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [{
        type: `foreignKey`,
        name: `test_foo_id_fkey`,
        columns: [
          `foo_id`,
        ],
        tableName: `foo`,
        referenceColumns: [
          `id`,
        ],
      }];

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test ADD CONSTRAINT test_foo_id_fkey FOREIGN KEY (foo_id) REFERENCES foo (id)`,
      ]);
    });

    it(`should add references without reference column`, () => {
      const from: TableMap = {
        foo: {
          name: `foo`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
        test: {
          name: `test`,
          columns: {
            foo_id: {
              name: `foo_id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [{
        type: `foreignKey`,
        name: `test_foo_id_fkey`,
        columns: [
          `foo_id`,
        ],
        tableName: `foo`,
        referenceColumns: [],
      }];

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test ADD CONSTRAINT test_foo_id_fkey FOREIGN KEY (foo_id) REFERENCES foo`,
      ]);
    });

    it(`should drop references`, () => {
      const from: TableMap = {
        foo: {
          name: `foo`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
        test: {
          name: `test`,
          columns: {
            foo_id: {
              name: `foo_id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [{
            type: `foreignKey`,
            name: `test_foo_id_fkey`,
            columns: [
              `foo_id`,
            ],
            tableName: `foo`,
            referenceColumns: [
              `id`,
            ],
          }],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [];

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test DROP CONSTRAINT test_foo_id_fkey`,
      ]);
    });

    it(`should add unique`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [{
        type: `unique`,
        name: `test_id_key`,
        columns: [
          `id`,
        ],
      }];

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test ADD CONSTRAINT test_id_key UNIQUE (id)`,
      ]);
    });

    it(`should add multi-column unique`, () => {
      const from: TableMap = {
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
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [{
        type: `unique`,
        name: `test_id_name_key`,
        columns: [
          `id`,
          `name`,
        ],
      }];

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test ADD CONSTRAINT test_id_name_key UNIQUE (id, name)`,
      ]);
    });

    it(`should drop unique`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [{
            type: `unique`,
            name: `test_id_key`,
            columns: [
              `id`,
            ],
          }],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [];

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test DROP CONSTRAINT test_id_key`,
      ]);
    });

    it(`should add primary key`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
            id: {
              name: `id`,
              dataType: `INTEGER`,
              modifiers: {},
            },
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [{
        type: `primaryKey`,
        name: `test_pkey`,
        columns: [
          `id`,
        ],
      }];

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test ADD CONSTRAINT test_pkey PRIMARY KEY (id)`,
      ]);
    });

    it(`should add multi-column primary key`, () => {
      const from: TableMap = {
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
            }
          },
          indexes: [],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [{
        type: `primaryKey`,
        name: `test_pkey`,
        columns: [
          `id`,
          `name`,
        ],
      }];

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test ADD CONSTRAINT test_pkey PRIMARY KEY (id, name)`,
      ]);
    });

    it(`should drop primary key`, () => {
      const from: TableMap = {
        test: {
          name: `test`,
          columns: {
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
          }],
        },
      };
      const to = cloneDeep(from);
      to.test!.indexes = [];

      const queries = create(from, to);
      expect(queries).toEqual([
        `ALTER TABLE test DROP CONSTRAINT test_pkey`,
      ]);
    });
  });
});
