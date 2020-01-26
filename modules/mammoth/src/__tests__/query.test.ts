import * as uuid from 'uuid';
import { not, now, EnumColumn } from '..';
import {
  IntegerColumn,
  TimestampWithTimeZoneColumn,
  UuidColumn,
  ByteaColumn,
  TextColumn,
} from '../columns';
import { createDatabase } from '../database';
import { Default, Now, UuidGenerateV4 } from '../keywords';
import { Query } from '../query';

class Account {
  id = new UuidColumn()
    .primary()
    .notNull()
    .default(new UuidGenerateV4());
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
  updatedAt = new TimestampWithTimeZoneColumn();
  value = new IntegerColumn().notNull();
}

class Test {
  id = new UuidColumn();
  accountId = new UuidColumn().notNull().references(() => db.account.id);
}

class Foo {
  id = new UuidColumn().primary().default(new UuidGenerateV4());
  value = new IntegerColumn();
}

class BinaryTest {
  id = new UuidColumn().primary().default(new UuidGenerateV4());
  value = new ByteaColumn().notNull();
}

class EnumTest {
  id = new UuidColumn().primaryKey().default(new UuidGenerateV4());
  letter = new EnumColumn(['a', 'b']).notNull();
}

class Bar {
  id = new UuidColumn().primaryKey().default(new UuidGenerateV4());
  val = new TextColumn().notNull();
}

const db = createDatabase(process.env.DATABASE_URL!, {
  account: new Account(),
  test: new Test(),
  foo: new Foo(),
  binaryTest: new BinaryTest(),
  enumTest: new EnumTest(),
  bar: new Bar(),
});

describe('Query', () => {
  afterAll(() => db.destroy());

  beforeAll(async () => {
    await db.exec(`CREATE TABLE IF NOT EXISTS account (
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE,
      value INTEGER NOT NULL
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS bar (
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
      val TEXT NOT NULL
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS foo (
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
      value INTEGER
    )`);
  });

  afterAll(async () => {
    await db.exec(`DROP TABLE IF EXISTS account, foo`);
  });

  describe('Array', () => {
    beforeEach(async () => {
      await db.insertInto(db.foo).values([
        {
          value: 1,
        },
        {
          value: 2,
        },
        {
          value: 3,
        },
      ]);
    });

    afterEach(() => db.deleteFrom(db.foo));

    it('should map all rows', async () => {
      const values = await db
        .select(db.foo.value)
        .from(db.foo)
        .orderBy(db.foo.value)
        .map(row => row.value * 2);

      expect(values).toEqual([2, 4, 6]);
    });

    it('should filter all rows', async () => {
      const values = await db
        .select(db.foo.value)
        .from(db.foo)
        .orderBy(db.foo.value)
        .filter(row => row.value! < 2);

      expect(values).toEqual([{ value: 1 }]);
    });
  });

  describe('first', () => {
    it('should return undefined when calling first on countable', async () => {
      const result = await db
        .insertInto(db.foo)
        .values({
          value: 123,
        })
        .first();
      expect(result).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw error on invalid query', async () => {
      await expect(
        db
          .select(db.foo.value)
          .from(db.account)
          .limit(1),
      ).rejects.toThrow();
    });
  });

  describe('enum', () => {
    beforeEach(async () => {
      await db.exec(`CREATE TYPE LETTER_ENUM AS ENUM ('a', 'b')`);

      await db.exec(`CREATE TABLE enum_test (
        id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        letter LETTER_ENUM NOT NULL
      )`);
    });

    afterEach(async () => {
      await db.exec(`DROP TABLE enum_test`);
      await db.exec(`DROP TYPE LETTER_ENUM`);
    });

    it('should create row', async () => {
      await db.insertInto(db.enumTest).values({
        id: null,
        letter: 'a',
      });
    });
  });

  describe('bytea', () => {
    beforeEach(() =>
      db.exec(`CREATE TABLE binary_test (
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
      value BYTEA NOT NULL
    )`),
    );

    afterEach(() => db.exec(`DROP TABLE binary_test`));

    it(`should create row`, async () => {
      await db.insertInto(db.binaryTest).values({
        id: null,
        value: new Buffer(`this is a test :)`),
      });
    });

    it(`should read from row`, async () => {
      await db.insertInto(db.binaryTest).values({ id: null, value: new Buffer(`Hello, world!`) });

      const rows = await db.select(db.binaryTest.id, db.binaryTest.value).from(db.binaryTest);

      expect(rows).toEqual([
        {
          id: rows[0]!.id,
          value: new Buffer(`Hello, world!`),
        },
      ]);
    });
  });

  describe('rows', () => {
    const ids = [uuid.v4(), uuid.v4(), uuid.v4()];
    beforeEach(() =>
      db.exec(`CREATE TABLE IF NOT EXISTS account (
        id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE,
        value INTEGER NOT NULL
      )`),
    );
    beforeEach(() =>
      db.exec(`CREATE TABLE IF NOT EXISTS account_item (
        id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        account_id UUID NOT NULL REFERENCES account (id)
      )`),
    );
    beforeEach(() =>
      db.exec(`INSERT INTO account (id, value) VALUES ($1, 123), ($2, 100), ($3, 42)`, ids),
    );

    afterEach(() => db.sql`DROP TABLE account_item, account`);

    it(`transaction should rollback`, async () => {
      const result = db.transaction(async db => {
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

      expect(result).rejects.toBe(`Simulating a failure somewhere in the transaction.`);

      const account = await db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.value.eq(101))
        .limit(1)
        .first();

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
    });

    it('select with alias', async () => {
      const rows = await db.select(db.account.id.as('test')).from(db.account);

      expect(rows).toEqual([
        {
          test: ids[0],
        },
        {
          test: ids[1],
        },
        {
          test: ids[2],
        },
      ]);
    });

    it('select with camelCase alias', async () => {
      const rows = await db
        .select(db.account.createdAt)
        .from(db.account)
        .limit(1);

      expect(rows).toEqual([
        {
          createdAt: rows[0]!.createdAt,
        },
      ]);
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

    it(`should select with count aggregate and alias`, async () => {
      const row = await db
        .select(db.account.id.count().as(`test`))
        .from(db.account)
        .limit(1)
        .first();

      expect(row).toBeDefined();
      expect(row!.test).toEqual('3');
    });

    it(`should select with count aggregate without alias`, async () => {
      const row = await db
        .select(db.account.id.count())
        .from(db.account)
        .limit(1)
        .first();

      expect(row).toEqual({
        id: '3',
      });
    });

    it(`should select first row`, async () => {
      await db
        .select(db.account.id)
        .from(db.account)
        .first();
    });

    it('should insert row with returning', async () => {
      const account = await db
        .insertInto(db.account)
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
      const count = await db.insertInto(db.account).values({
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

      expect(rows).toEqual([
        {
          id: ids[0],
        },
      ]);
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

  const queries: QueryTest[] = [
    {
      text: `SELECT account.created_at FROM account`,
      query: db.select(db.account.createdAt).from(db.account),
    },
    {
      text: `SELECT account.id AS "id" FROM account`,
      query: db.select(db.account.id.as(`id`)).from(db.account),
    },
    {
      text: `SELECT account.id AS "id", test.id AS "testId" FROM account INNER JOIN test ON test.account_id = account.id`,
      query: db
        .select(db.account.id, db.test.id.as(`testId`))
        .from(db.account)
        .innerJoin(db.test)
        .on(db.test.accountId.eq(db.account.id)),
    },
    {
      text: `SELECT account.id FROM account WHERE account.id = $1`,
      parameters: [`test`],
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.id.eq(`test`)),
    },
    {
      text: `SELECT account.id FROM account WHERE account.id = $1 AND account.id = $2`,
      parameters: [`test`, `test2`],
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.id.eq(`test`).and(db.account.id.eq(`test2`))),
    },
    {
      text: `SELECT account.id, account.created_at FROM account WHERE account.created_at > NOW() - $1 LIMIT 10`,
      parameters: [`2 days`],
      query: db
        .select(db.account.id, db.account.createdAt)
        .from(db.account)
        .where(db.account.createdAt.gt(now().minus(`2 days`)))
        .limit(10),
    },
    {
      text: `SELECT account.id FROM account WHERE account.value = $1 LIMIT 1`,
      parameters: [123],
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.value.eq(123))
        .limit(1),
    },
    {
      text: `SELECT account.id FROM account`,
      query: db.select(db.account.id).from(db.account),
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.updatedAt.isNull()),
      text: `SELECT account.id FROM account WHERE account.updated_at IS NULL`,
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.updatedAt.isNotNull()),
      text: `SELECT account.id FROM account WHERE account.updated_at IS NOT NULL`,
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .orderBy(db.account.createdAt.desc().nullsFirst()),
      text: `SELECT account.id FROM account ORDER BY account.created_at DESC NULLS FIRST`,
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .orderBy(db.account.createdAt.asc().nullsLast()),
      text: `SELECT account.id FROM account ORDER BY account.created_at ASC NULLS LAST`,
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .orderBy(db.account.createdAt.desc(), db.account.updatedAt.asc()),
      text: `SELECT account.id FROM account ORDER BY account.created_at DESC, account.updated_at ASC`,
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .having(db.account.value.gt(100)),
      text: `SELECT account.id FROM account HAVING account.value > $1`,
      parameters: [100],
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .having(db.account.value.in([1, 2, 3])),
      text: `SELECT account.id FROM account HAVING account.value IN ($1)`,
      parameters: [[1, 2, 3]],
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(not(db.account.value.eq(123))),
      text: `SELECT account.id FROM account WHERE NOT (account.value = $1)`,
      parameters: [123],
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .groupBy(db.account.value),
      text: `SELECT account.id FROM account GROUP BY account.value`,
    },
    {
      query: db
        .select(db.account.id.count().as(`count`))
        .from(db.account)
        .groupBy(db.account.value),
      text: `SELECT COUNT(account.id) AS "count" FROM account GROUP BY account.value`,
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.value.between(0).and(100)),
      text: `SELECT account.id FROM account WHERE account.value BETWEEN $1 AND $2`,
      parameters: [0, 100],
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.value.betweenSymmetric(0).and(100)),
      text: `SELECT account.id FROM account WHERE account.value BETWEEN SYMMETRIC $1 AND $2`,
      parameters: [0, 100],
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .limit(5)
        .offset(10),
      text: `SELECT account.id FROM account LIMIT 5 OFFSET 10`,
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(
          db.account.id.in(
            db
              .select(db.test.accountId)
              .from(db.test)
              .where(db.test.id.eq('1' as any)),
          ),
        ),
      text: `SELECT account.id FROM account WHERE account.id IN (SELECT test.account_id FROM test WHERE test.id = $1)`,
      parameters: ['1'],
    },
    {
      query: db.select(db.account.id.as(`test`)).from(db.account),
      text: `SELECT account.id AS "test" FROM account`,
    },
    {
      query: db.select(db.account.value.sum()).from(db.account),
      text: `SELECT SUM(account.value) FROM account`,
    },
    {
      query: db.select(db.account.value.min()).from(db.account),
      text: `SELECT MIN(account.value) FROM account`,
    },
    {
      query: db.select(db.account.value.avg()).from(db.account),
      text: `SELECT AVG(account.value) FROM account`,
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.value.notIn([1, 2, 3])),
      text: `SELECT account.id FROM account WHERE account.value NOT IN ([$1, $2, $3])`,
      parameters: [1, 2, 3],
    },
    {
      query: db
        .select(db.bar.id)
        .from(db.bar)
        .where(db.bar.val.like('%test%')),
      text: `SELECT bar.id FROM bar WHERE bar.val LIKE $1`,
      parameters: [`%test%`],
    },
    {
      query: db
        .select(db.bar.id)
        .from(db.bar)
        .where(db.bar.val.ilike('%test%')),
      text: `SELECT bar.id FROM bar WHERE bar.val ILIKE $1`,
      parameters: [`%test%`],
    },
    {
      query: db
        .select(db.bar.id)
        .from(db.bar)
        .where(db.bar.val.ne('test')),
      text: `SELECT bar.id FROM bar WHERE bar.val != $1`,
      parameters: [`test`],
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.value.gte(1)),
      text: `SELECT account.id FROM account WHERE account.value >= $1`,
      parameters: [1],
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.value.lt(1)),
      text: `SELECT account.id FROM account WHERE account.value < $1`,
      parameters: [1],
    },
    {
      query: db
        .select(db.account.id)
        .from(db.account)
        .where(db.account.value.lte(1)),
      text: `SELECT account.id FROM account WHERE account.value <= $1`,
      parameters: [1],
    },
    // TODO: minus, multiply, divide, modulo, concat

    // Insert
    {
      text: `INSERT INTO account (created_at, value) VALUES ($1, $2)`,
      query: db.insertInto(db.account).values(account),
      parameters: [account.createdAt, account.value],
    },
    {
      text: `INSERT INTO account (created_at, value) VALUES ($1, $2) RETURNING account.id AS "id"`,
      query: db
        .insertInto(db.account)
        .values(account)
        .returning(db.account.id),
      parameters: [account.createdAt, account.value],
    },
    {
      text: `INSERT INTO foo DEFAULT VALUES`,
      query: db.insertInto(db.foo).values({
        id: null,
        value: null,
      }),
      parameters: [],
    },
    {
      text: `INSERT INTO account (value, created_at) VALUES ($1, DEFAULT)`,
      query: db.insertInto(db.account).values({
        value: 123,
        createdAt: new Default(),
      }),
      parameters: [],
    },
    {
      text: `INSERT INTO foo (value) VALUES ($1) ON CONFLICT (value) DO NOTHING`,
      query: db
        .insertInto(db.foo)
        .values({
          value: 123,
        })
        .onConflict(`value`)
        .doNothing(),
      parameters: [123],
    },
    {
      text: `INSERT INTO foo (value) VALUES ($1) ON CONFLICT (value) DO UPDATE SET value = $2`,
      query: db
        .insertInto(db.foo)
        .values({ value: 123 })
        .onConflict('value')
        .doUpdateSet({
          value: 124,
        }),
      parameters: [123, 124],
    },

    // Update
    {
      query: db
        .update(db.account)
        .set({
          value: 1,
        })
        .where(db.account.id.eq(`123`)),
      text: `UPDATE account SET value = $1 WHERE account.id = $2`,
      parameters: [1, `123`],
    },
    {
      query: db.update(db.account).set({ createdAt: new Default() }),
      parameters: [],
      text: `UPDATE account SET created_at = DEFAULT`,
    },
    {
      query: db.update(db.account).set({ value: db.account.value.plus(1) }),
      text: `UPDATE account SET value = account.value + $1`,
      parameters: [1],
    },
  ];

  describe('query tests', () => {
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
});
