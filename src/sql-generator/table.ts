import { TableWrapper } from '../table';

// TODO: We could also immediately generate the AST from here?
export const generateCreateTableSql = <T extends TableWrapper<any>>(table: T) => {
  const columns = table.getColumns().map(column => {
    const config = column.getConfig();
    const parts = [
      `  ${column.snakeCaseName}`,

      // TODO: it's probably nicer to have a function here so once we refactor the original column
      // out of the column wrapper this still works.
      column.column.dataType,
    ];

    if (config.primary) {
      parts.push(`PRIMARY KEY`);
    }

    if (config.notNull) {
      parts.push(`NOT NULL`);
    }

    if (config.default) {
      // TODO: Can we escape this?
      parts.push(`DEFAULT ${config.default}`);
    }

    if (config.check) {
      // TODO: Can we escape this?
      parts.push(`CHECK (${config.check})`);
    }

    if (config.unique) {
      parts.push(`UNIQUE`);
    }

    if (config.references) {
      parts.push(`REFERENCES ${config.references.tableName} (${config.references.columnName})`);
    }

    return parts.join(' ');
  });

  return `CREATE TABLE ${table.getName()} (\n${columns.join(`,\n`)}\n)`;
}