import { Db, Table } from './db';

const toSnakeCase = (string: string) =>
  string
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');

export const generateSql = (db: Db) => {
  const tableDefinitions = db.getTableDefinitions();

  return tableDefinitions.map((table) => ({
    name: table.name,
    sql: generateCreateTableSql(table, tableDefinitions),
  }));
};

const generateCreateTableSql = (
  table: Table,
  tableDefinitions: { name: string; originalDefinition: {} }[],
) => {
  const columns = table.columns.map((column) => {
    const parts = [`  ${toSnakeCase(column.name)}`, column.dataType];

    if (column.isPrimaryKey) {
      parts.push(`PRIMARY KEY`);
    }

    if (column.isNotNull) {
      parts.push(`NOT NULL`);
    }

    if (column.defaultExpression !== undefined) {
      parts.push(`DEFAULT ${column.defaultExpression}`);
    }

    if (column.checkExpression) {
      parts.push(`CHECK (${column.checkExpression})`);
    }

    if (column.isUnique) {
      parts.push(`UNIQUE`);
    }

    if (column.referencesTable) {
      const referenceTable = tableDefinitions.find(
        (definition) => definition.originalDefinition === column.referencesTable,
      );
      if (!referenceTable) {
        throw new Error(`Could not find reference table in column '${column.name}'.`);
      }

      parts.push(
        `REFERENCES ${toSnakeCase(referenceTable.name)} (${toSnakeCase(column.referencesColumn!)})`,
      );
    } else if (column.referencesSelf) {
      parts.push(
        `REFERENCES ${toSnakeCase(table.name)} (${toSnakeCase(column.referencesColumn!)})`,
      );
    }

    return parts.join(' ');
  });

  return `CREATE TABLE ${toSnakeCase(table.name)} (\n${columns.join(`,\n`)}\n)`;
};
