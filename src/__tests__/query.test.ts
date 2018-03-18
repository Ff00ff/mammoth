import * as uuid from 'uuid';
import { not, now, Uuid } from '..';
import { IntegerColumn, TimestampWithTimeZoneColumn, UuidColumn, ByteaColumn } from '../columns';
import { createDatabase } from '../database/pool';
import { Default, Now, UuidGenerateV4 } from '../keywords';
import { Query } from '../query';

class Account {
  id = new UuidColumn().primary().notNull().default(new UuidGenerateV4());
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
  updatedAt = new TimestampWithTimeZoneColumn();
  value = new IntegerColumn().notNull();
}

class Test {
  id = new UuidColumn();
  accountId = new UuidColumn().notNull().references<Db>(db => db.account.id);
}

class Foo {
  id = new UuidColumn().primary().default(new UuidGenerateV4());
  value = new IntegerColumn();
}

class BinaryTest {
  id = new UuidColumn().primary().default(new UuidGenerateV4());
  value = new ByteaColumn().notNull();
}

const db = createDatabase({
  account: new Account(),
  test: new Test(),
  foo: new Foo(),
  binaryTest: new BinaryTest(),
});

type Db = typeof db;

describe('Query', () => {
  afterAll(() => db.destroy());

  describe('bytea', () => {
    beforeEach(() => db.exec(`CREATE TABLE binary_test (
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
      value BYTEA NOT NULL
    )`));

    afterEach(() => db.exec(`DROP TABLE binary_test`));

    it(`should create row`, async () => {
      await db
        .insertInto(db.binaryTest)
        .values({
          id: null,
          value: new Buffer(`this is a test :)`),
        });
    });

    it(`should read from row`, async () => {
      await db.insertInto(db.binaryTest).values({ id: null, value: new Buffer(`Hello, world!`)});

      const rows = await db.select(db.binaryTest.id, db.binaryTest.value).from(db.binaryTest);

      expect(rows).toEqual([{
        id: rows[0].id,
        value: new Buffer(`Hello, world!`),
      }]);
    })
  })

  describe('rows', () => {
    const ids = [uuid.v4(), uuid.v4(), uuid.v4()];
    beforeEach(() => db.exec(`CREATE TABLE account (
        id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE,
        value INTEGER NOT NULL
      )`));
    beforeEach(() => db.exec(`CREATE TABLE account_item (
        id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        account_id UUID NOT NULL REFERENCES account (id)
      )`));
    beforeEach(() => db.exec(`INSERT INTO account (id, value) VALUES ($1, 123), ($2, 100), ($3, 42)`, ids));

    afterEach(() => db.exec(`DROP TABLE account_item, account`));

    it(`transaction should rollback`, async () => {
      await db.transaction(async db => {
        await db
          .insertInto(db.account)
          .values({
            id: null,
            createdAt: null,
            updatedAt: null,
            value: 101,
          })
          .returning(`id`, `value`)
          .first();

        await Promise.reject(`Simulating a failure somewhere in the transaction.`);
      });

      const account = await db.select(db.account.id).from(db.account).where(db.account.value.eq(101)).limit(1).first();

      expect(account).toBeUndefined();
    });

    it(`transaction should commit`, async () => {
      const account = await db.transaction(async db => {
        const account = await db
          .insertInto(db.account)
          .values({
            id: null,
            createdAt: null,
            updatedAt: null,
            value: 654,
          })
          .returning(`id`);

        return account;
      });

      expect(account).toBeDefined();
      expect(account!.id).toBeTruthy();
    })

    it('select with alias', async () => {
      const rows = await db.select(db.account.id.as('test')).from(db.account);

      expect(rows).toEqual([{
        test: ids[0],
      }, {
        test: ids[1],
      }, {
        test: ids[2],
      }])
    });

    it('select with camelCase alias', async () => {
      const rows = await db.select(db.account.createdAt)
        .from(db.account)
        .limit(1);

      expect(rows).toEqual([{
        createdAt: rows[0]!.createdAt,
      }])
    });

    it(`should select with max aggregate`, async () => {
      const row = await db
        .select(db.account.value.max().as(`test`))
        .from(db.account)
        .limit(1)
        .first();

      expect(row).toBeDefined();
      expect(row!.test).toEqual(123);
    });

    it(`should select with count aggregate`, async () => {
      const row = await db
        .select(db.account.id.count().as(`test`))
        .from(db.account)
        .limit(1)
        .first();

      expect(row).toBeDefined();
      expect(row!.test).toEqual('3');
    });

    it(`should select first row`, async () => {
      await db
        .select(db.account.id)
        .from(db.account)
        .first();
    })

    it('should insert row with returning', async () => {
      const account = await db.insertInto(db.account)
        .values({
          id: null,
          createdAt: null,
          updatedAt: null,
          value: 123,
        })
        .returning(db.account.id);

      expect(account).toEqual({
        id: account.id,
      });
    });

    it('should insert without returning', async () => {
      const count = await db
        .insertInto(db.account)
        .values({
          id: null,
          createdAt: null,
          updatedAt: null,
          value: 101,
        });

      expect(count).toEqual(1);
    });

    it('should update', async () => {
      const count = await db
        .update(db.account)
        .set({
          value: 654,
        })
        .where(db.account.value.gt(100));

      expect(count).toEqual(1);
    });

    it(`should update with returning`, async () => {
      const rows = await db
        .update(db.account)
        .set({
          value: 654,
        })
        .where(db.account.value.gt(100))
        .returning(db.account.id);

      expect(rows).toEqual([{
        id: ids[0],
      }]);
    });
  });

  interface QueryTest {
    text: string;
    parameters?: any[];
    query: Query<any, any, any>;
    only?: boolean;
  }

  const account = {
    id: null,
    createdAt: new Date(),
    value: 123,
    updatedAt: null,
  };

  const queries: QueryTest[] = [{
    text: `SELECT account.created_at FROM account`,
    query: db.select(db.account.createdAt).from(db.account),
  }, {
    text: `SELECT account.id AS "id" FROM account`,
    query: db.select(db.account.id.as(`id`)).from(db.account)
  }, {
    text: `SELECT account.id AS "id", test.id AS "testId" FROM account INNER JOIN test ON test.account_id = account.id`,
    query: db
      .select(db.account.id, db.test.id.as(`testId`))
      .from(db.account)
      .innerJoin(db.test).on(db.test.accountId.eq(db.account.id))
  }, {
    text: `SELECT account.id FROM account INNER JOIN test USING test.id = account.id`,
    query: db
      .select(db.account.id)
      .from(db.account)
      .innerJoin(db.test).using('id')
  }, {
    text: `SELECT account.id FROM account WHERE account.id = $1`,
    parameters: [`test`],
    query: db
      .select(db.account.id)
      .from(db.account)
      .where(db.account.id.eq(new Uuid(`test`)))
  }, {
    text: `SELECT account.id FROM account WHERE account.id = $1 AND account.id = $2`,
    parameters: [`test`, `test2`],
    query: db
      .select(db.account.id)
      .from(db.account)
      .where(db.account.id.eq(new Uuid(`test`)).and(db.account.id.eq(new Uuid(`test2`))))
  }, {
    text: `SELECT account.id, account.created_at FROM account WHERE account.created_at > NOW() - $1 LIMIT 10`,
    parameters: [`2 days`],
    query: db
      .select(db.account.id, db.account.createdAt)
      .from(db.account)
      .where(db.account.createdAt.gt(now().minus(`2 days`)))
      .limit(10),
  }, {
    text: `SELECT account.id FROM account WHERE account.value = $1 LIMIT 1`,
    parameters: [123],
    query: db
      .select(db.account.id)
      .from(db.account)
      .where(db.account.value.eq(123))
      .limit(1)
  }, {
    text: `SELECT account.id FROM account`,
    query: db
      .select(db.account.id)
      .from(db.account)
  }, {
    query: db.select(db.account.id).from(db.account).where(db.account.updatedAt.isNull()),
    text: `SELECT account.id FROM account WHERE account.updated_at IS NULL`,
  }, {
    query: db.select(db.account.id).from(db.account).where(db.account.updatedAt.isNotNull()),
    text: `SELECT account.id FROM account WHERE account.updated_at IS NOT NULL`,
  }, {
    query: db.select(db.account.id).from(db.account).orderBy(db.account.createdAt.desc().nullsFirst()),
    text: `SELECT account.id FROM account ORDER BY account.created_at DESC NULLS FIRST`,
  }, {
    query: db.select(db.account.id).from(db.account).orderBy(db.account.createdAt.asc().nullsLast()),
    text: `SELECT account.id FROM account ORDER BY account.created_at ASC NULLS LAST`,
  }, {
    query: db.select(db.account.id).from(db.account).orderBy(db.account.createdAt.desc(), db.account.updatedAt.asc()),
    text: `SELECT account.id FROM account ORDER BY account.created_at DESC, account.updated_at ASC`,
  }, {
    query: db.select(db.account.id).from(db.account).having(db.account.value.gt(100)),
    text: `SELECT account.id FROM account HAVING account.value > $1`,
    parameters: [100],
  }, {
    query: db.select(db.account.id).from(db.account).having(db.account.value.in([1, 2, 3])),
    text: `SELECT account.id FROM account HAVING account.value IN ($1)`,
    parameters: [[1, 2, 3]],
  }, {
    query: db.select(db.account.id).from(db.account).where(not(db.account.value.eq(123))),
    text: `SELECT account.id FROM account WHERE NOT (account.value = $1)`,
    parameters: [123],
  }, {
    query: db.select(db.account.id).from(db.account).groupBy(db.account.value),
    text: `SELECT account.id FROM account GROUP BY account.value`,
  }, {
    query: db.select(db.account.id.count().as(`count`)).from(db.account).groupBy(db.account.value),
    text: `SELECT COUNT(account.id) AS "count" FROM account GROUP BY account.value`,
  }, {
    query: db.select(db.account.id).from(db.account).where(db.account.value.between(0, 100)),
    text: `SELECT account.id FROM account WHERE account.value BETWEEN $1 AND $2`,
    parameters: [0, 100],
  }, {
    query: db.select(db.account.id).from(db.account).limit(5).offset(10),
    text: `SELECT account.id FROM account LIMIT 5 OFFSET 10`,
  },

  // Insert
  {
    text: `INSERT INTO account (created_at, value) VALUES ($1, $2)`,
    query: db.insertInto(db.account).values(account),
    parameters: [account.createdAt, account.value],
  }, {
    text: `INSERT INTO account (created_at, value) VALUES ($1, $2) RETURNING account.id AS "id"`,
    query: db
      .insertInto(db.account)
      .values(account)
      .returning(db.account.id),
    parameters: [account.createdAt, account.value],
  }, {
    text: `INSERT INTO foo DEFAULT VALUES`,
    query: db
      .insertInto(db.foo)
      .values({
        id: null,
        value: null,
      }),
    parameters: [],
  }, {
    text: `INSERT INTO foo (value) VALUES ($1) ON CONFLICT (value) DO NOTHING`,
    query: db
      .insertInto(db.foo)
      .values({
        id: null,
        value: 123,
      })
      .onConflict(`value`)
      .doNothing(),
    parameters: [123],
  },

  // Update
  {
    query: db
      .update(db.account)
      .set({
        value: 1,
      })
      .where(db.account.id.eq(new Uuid(`123`))),
    text: `UPDATE account SET value = $1 WHERE account.id = $2`,
    parameters: [1, `123`],
  }, {
    query: db.update(db.account).set({ createdAt: new Default() }),
    parameters: [],
    text: `UPDATE account SET created_at = DEFAULT`,
  }, {
    query: db.update(db.account).set({ value: db.account.value.plus(1) }),
    text: `UPDATE account SET value = account.value + $1`,
    parameters: [1],
  }];

  (queries.filter(queryTest => queryTest.only) || queries).forEach(queryTest => {
    it(queryTest.text, () => {
      const query = queryTest.query.toQuery();

      expect(query).toEqual({
        text: queryTest.text,
        parameters: queryTest.parameters || [],
      });
    });
  });
});