import { TextColumn, UuidColumn } from '../../columns';
import { createDatabase } from '../../database';
import { Table } from '../../table';
import { generateCreateTableSql } from '../table';

describe('generateCreateTableSql', () => {
  it('should generate a simple table', () => {
    class Organization extends Table {
      id = new UuidColumn().primary().notNull().default(`uuid_generate_v4()`);
      apiKey = new TextColumn().notNull().unique();
    }

    const db = createDatabase({
      organization: new Organization(),
    });

    const sql = generateCreateTableSql(db.organization);

    expect(sql).toMatchSnapshot();
  })
});