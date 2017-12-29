import { IntegerColumn, TimestampWithTimeZoneColumn, UuidColumn } from '../columns';
import { createDatabase } from '../database';
import { Query } from '../query';
import { Unsafe } from '../unsafe';

class Account {
  id = new UuidColumn().primary().notNull().default(new Unsafe(`uuid_generate_v4()`));
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Unsafe(`NOW()`));
  updatedAt = new TimestampWithTimeZoneColumn();
  value = new IntegerColumn().notNull();
}

class Test {
  id = new UuidColumn();
  accountId = new UuidColumn().notNull().references<Database>(db => db.account.id);
}

class Foo {
  id = new UuidColumn().primary().default(`uuid_generate_v4()`);
  value = new IntegerColumn();
}

const db = createDatabase({
  account: new Account(),
  test: new Test(),
  foo: new Foo(),
});

type Database = typeof db;

describe('Query', () => {
  afterAll(() => db.pool.end());

  describe('rows', () => {
    beforeEach(() => db.exec(`CREATE TABLE account (
        id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE,
        value INTEGER NOT NULL
      )`));
    beforeEach(() => db.exec(`INSERT INTO account (value) VALUES (123), (100), (42)`));

    afterEach(() => db.exec(`DROP TABLE account`));

    db.transaction(async db => {
      const account = await db.account
        .insert({
          id: null,
          createdAt: null,
          updatedAt: null,
          value: 0,
        })
        .returning('id')
        .
        .first();


    });

    it('simple select', async () => {
      const rows = await db.account
        .select('id', 'value')
        .from(db.account)
        .limit(3);

      expect(rows).toEqual([{
        id: rows[0].id,
        value: 123,
      }, {
        id: rows[1].id,
        value: 100,
      }, {
        id: rows[2].id,
        value: 42,
      }]);
    });

    it('should insert row and return it\'s id', async () => {
      const rows = await db.account
        .insert({
          id: null,
          createdAt: null,
          updatedAt: null,
          value: 123,
        })
        .returning(`id`);

      expect(rows).toEqual([{
        id: rows[0].id,
      }]);
    });

    it('should insert row and return insert count', async () => {
      const count = await db.account
        .insert({
          id: null,
          createdAt: null,
          updatedAt: null,
          value: 101,
        });

      expect(count).toEqual(1);
    });

    it('should select rows', async () => {
      const rows = await db.account
        .select({
          id: db.account.id,
          value: db.account.value,
          createdAt: db.account.createdAt,
          updatedAt: db.account.updatedAt,
        })
        .from(db.account)
        .limit(1);

      expect(rows).toEqual([{
        id: rows[0].id,
        value: 123,
        updatedAt: null,
        createdAt: rows[0].createdAt,
      }]);
    });
  });

  interface QueryTest {
    text: string;
    parameters?: any[];
    query: Query<any, any, any, any, any>;
  }

  const account = {
    id: null,
    createdAt: new Date(),
    value: 123,
    updatedAt: null,
  };

  const queries: QueryTest[] = [{
    text: `SELECT account.created_at FROM account`,
    query: db.account
      .select(`createdAt`)
      .from(db.account),
  }, {
    text: `SELECT account.id AS "id" FROM account`,
    query: db.account
      .select({ id: db.account.id })
      .from(db.account)
  }, {
    text: `SELECT account.id AS "id", test.id AS "testId" FROM account INNER JOIN test ON test.account_id = account.id`,
    query: db.account
      .select({
        id: db.account.id,
        testId: db.test.id,
      })
      .from(db.account)
      .innerJoin(db.test).on(db.test.accountId.eq(db.account.id))
  }, {
    text: `SELECT account.id FROM account WHERE account.id = $1`,
    parameters: [`test`],
    query: db.account
      .select('id')
      .from(db.account)
      .where(db.account.id.eq(`test`))
  }, {
    text: `SELECT account.id FROM account WHERE account.id = $1 AND account.id = $2`,
    parameters: [`test`, `test2`],
    query: db.account
      .select('id')
      .from(db.account)
      .where(db.account.id.eq(`test`).and(db.account.id.eq(`test2`)))
  }, {
    text: `SELECT account.id, account.created_at FROM account WHERE account.created_at > NOW() - $1 LIMIT 10`,
    parameters: [`2 days`],
    query: db.account
      .select('id', 'createdAt')
      .from(db.account)
      .where(db.account.createdAt.gt(db.now().minus(`2 days`)))
      .limit(10)
  }, {
    text: `SELECT account.id FROM account WHERE account.value = $1 LIMIT 1`,
    parameters: [123],
    query: db.account
      .select('id')
      .from(db.account)
      .where(db.account.value.eq(123))
      .limit(1)
  }, {
    text: `SELECT account.id FROM account`,
    query: db.account
      .select(`id`)
      .from(db.account)
  }, {
    query: db.account.select(`id`).from(db.account).where(db.account.updatedAt.isNull()),
    text: `SELECT account.id FROM account WHERE account.updated_at IS NULL`,
  }, {
    query: db.account.select(`id`).from(db.account).where(db.account.updatedAt.isNotNull()),
    text: `SELECT account.id FROM account WHERE account.updated_at IS NOT NULL`,
  }, {
    query: db.account.select(`id`).from(db.account).orderBy(db.account.createdAt.desc().nullsFirst()),
    text: `SELECT account.id FROM account ORDER BY account.created_at DESC NULLS FIRST`,
  }, {
    query: db.account.select(`id`).from(db.account).orderBy(db.account.createdAt.asc().nullsLast()),
    text: `SELECT account.id FROM account ORDER BY account.created_at ASC NULLS LAST`,
  }, {
    query: db.account.select(`id`).from(db.account).orderBy(db.account.createdAt.desc(), db.account.updatedAt.asc()),
    text: `SELECT account.id FROM account ORDER BY account.created_at DESC, account.updated_at ASC`,
  }, {
    query: db.account.select(`id`).from(db.account).having(db.account.value.gt(100)),
    text: `SELECT account.id FROM account HAVING account.value > 100`,
  }, {
    query: db.account.select(`id`).from(db.account).having(db.account.value.in([1, 2, 3])),
    text: `SELECT account.id FROM account HAVING account.id IN ($1)`,
    parameters: [[1, 2, 3]],
  }, {
    query: db.account.select(`id`).from(db.account).where(db.not(db.account.value.eq(123))),
    text: `SELECT account.id FROM account WHERE NOT (account.value = $1)`,
    parameters: [123],
  }, {
    query: db.account.select(`id`).from(db.account).groupBy(`value`),
    text: `SELECT account.id FROM account GROUP BY account.value`,
  }, {
    query: db.account.select({ count: db.account.id.count() }).from(db.account).groupBy(db.account.value),
    text: `SELECT COUNT(account.id) FROM account GROUP BY account.value`,
  }, {
    query: db.account.select(`id`).from(db.account).where(db.account.value.between(0, 100)),
    text: `SELECT account.id FROM account WHERE account.value BETWEEN $1 AND $2`,
    parameters: [0, 100],
  }, {
    query: db.account.select(`id`).from(db.account).limit(5).offset(10),
    text: `SELECT account.id FROM account LIMIT 5 OFFSET 10`,
  },

  // Insert
  {
    text: `INSERT INTO account (created_at, value) VALUES ($1, $2)`,
    query: db.account.insert(account),
    parameters: [account.createdAt, account.value],
  }, {
    text: `INSERT INTO account (created_at, value) VALUES ($1, $2) RETURNING account.id AS "id"`,
    query: db.account
      .insert(account)
      .returning('id'),
    parameters: [account.createdAt, account.value],
  }, {
    text: `INSERT INTO foo DEFAULT VALUES`,
    query: db.foo
      .insert({
        id: null,
        value: null,
      }),
    parameters: [],
  }, {
    text: `INSERT INTO foo (value) VALUES ($1) ON CONFLICT (value) DO NOTHING`,
    query: db.foo
      .insert({
        id: null,
        value: 123,
      })
      .onConflict(`value`)
      .doNothing(),
    parameters: [123],
  },

  // Update
  {
    query: db.account
      .update({
        value: 1,
      })
      .where(db.account.id.eq(`123`))
      .limit(1),
    text: `UPDATE account SET value = $1 WHERE account.id = $2 LIMIT 1`,
    parameters: [1, `123`],
  }, {
    query: db.account.update({ createdAt: db.default() }),
    parameters: [],
    text: `UPDATE account SET created_at = DEFAULT`,
  }, {
    query: db.account.update({ value: db.account.value.plus(1) }),
    text: `UPDATE account SET account.value = account.value + 1`,
  }];

  queries.forEach(queryTest => {
    it(queryTest.text, () => {
      const query = queryTest.query.toQuery();

      expect(query).toEqual({
        text: queryTest.text,
        parameters: queryTest.parameters || [],
      });
    });
  });
});