import { Unsafe, UuidGenerateV4 } from '../..';
import { TextColumn, UuidColumn, EnumColumn } from '../../columns';
import { createDatabase } from '../../database/pool';
import { Table } from '../../table';
import { generateCreateTableSql, generateSql } from '../table';

describe('generate sql', () => {
  it('should generate a simple table', () => {
    class Organization extends Table {
      id = new UuidColumn().primary().notNull().default(new Unsafe(`uuid_generate_v4()`));
      apiKey = new TextColumn().notNull().unique();
    }

    const db = createDatabase({
      organization: new Organization(),
    });

    const sql = generateCreateTableSql(db.organization);

    expect(sql).toMatchSnapshot();
  });

  it('should generate a table with enum without name', () => {
    class EnumTest {
      id = new UuidColumn().primaryKey().notNull().default(new UuidGenerateV4());
      value = new EnumColumn([`A`, `B`]).notNull();
    }

    const db = createDatabase({
      enumTest: new EnumTest(),
    });

    const sql = generateSql(db.enumTest);

    expect(sql).toMatchSnapshot();
  });

  it('should generate a table with enum with name', () => {
    class EnumTest {
      id = new UuidColumn().primaryKey().notNull().default(new UuidGenerateV4());
      value = new EnumColumn([`A`, `B`], `MY_ENUM`).notNull();
    }

    const db = createDatabase({
      enumTest: new EnumTest(),
    });

    const sql = generateSql(db.enumTest);

    expect(sql).toMatchSnapshot();
  })
});