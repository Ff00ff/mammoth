import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '..';

import { FromItem } from '../with';
import { sum } from '../sql-functions';
import { toSnap } from './helpers';

describe(`with`, () => {
  const orderLog = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    region: text().notNull(),
    product: text().notNull(),
    quantity: integer().notNull(),
    amount: integer().notNull(),
  });

  const db = defineDb(
    {
      orderLog,
    },
    () => Promise.resolve({ rows: [], affectedCount: 0 }),
  );

  it(`should with multiple queries and select`, () => {
    const query = db.with(
      `regionalSales`,
      () =>
        db
          .select(db.orderLog.region, sum(db.orderLog.amount).as(`totalSales`))
          .from(db.orderLog)
          .groupBy(db.orderLog.region),
      `topRegions`,
      ({ regionalSales }) =>
        db
          .select(regionalSales.region)
          .from(regionalSales)
          .where(
            regionalSales.totalSales.gt(
              db.select(sum(regionalSales.totalSales).divide(10)).from(regionalSales),
            ),
          ),
      ({ topRegions }) =>
        db
          .select(
            db.orderLog.region,
            db.orderLog.product,
            sum(db.orderLog.quantity).as(`productUnits`),
            sum(db.orderLog.amount).as(`productSales`),
          )
          .from(db.orderLog)
          .where(db.orderLog.region.in(db.select(topRegions.region).from(topRegions)))
          .groupBy(db.orderLog.region, db.orderLog.product),
    );

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          10,
        ],
        "text": "WITH \\"regionalSales\\" AS (SELECT order_log.region, SUM (order_log.amount) \\"totalSales\\" FROM order_log GROUP BY order_log.region), \\"topRegions\\" AS (SELECT \\"regionalSales\\".region FROM \\"regionalSales\\" WHERE \\"regionalSales\\".\\"totalSales\\" > (SELECT SUM (\\"regionalSales\\".\\"totalSales\\") / $1 FROM \\"regionalSales\\")) SELECT order_log.region, order_log.product, SUM (order_log.quantity) \\"productUnits\\", SUM (order_log.amount) \\"productSales\\" FROM order_log WHERE order_log.region IN (SELECT \\"topRegions\\".region FROM \\"topRegions\\") GROUP BY order_log.region, order_log.product",
      }
    `);
  });
});
