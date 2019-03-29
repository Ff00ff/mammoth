import { TableWrapper } from '../table';
import { EnumColumn } from '..';

// TODO: We could also immediately generate the AST from here?

export const generateSql = <T extends TableWrapper<any>>(table: T) => {
  return [...generateTypeSql(table), generateCreateTableSql(table)];
};

export const generateTypeSql = <T extends TableWrapper<any>>(table: T) => {
  return table
    .getColumns()
    .filter(column => column.column instanceof EnumColumn)
    .map(column => {
      const enumColumn = column.column as EnumColumn<any>;

      if (!enumColumn.dataType) {
        enumColumn.dataType = `${table.getName()}_${column.snakeCaseName}_ENUM`.toUpperCase();
      }

      return `CREATE TYPE ${enumColumn.dataType} AS ENUM (${enumColumn.values
        .map((value: string) => `'${value}'`)
        .join(`, `)})`;
    });
};

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

    if (config.default !== undefined) {
      // TODO: should we escape this?
      parts.push(`DEFAULT ${config.default}`);
    }

    if (config.check) {
      // TODO: should we escape this?
      parts.push(`CHECK (${config.check})`);
    }

    if (config.unique) {
      parts.push(`UNIQUE`);
    }

    if (config.references) {
      parts.push(`REFERENCES ${config.references.tableName} (${config.references.columnName})`);

      if (config.onUpdate) {
        if (config.onUpdate === 'cascade') {
          parts.push(`ON UPDATE CASCADE`);
        } else if (config.onUpdate === 'restrict') {
          parts.push(`ON UPDATE RESTRICT`);
        } else {
          //
        }
      }

      if (config.onDelete) {
        if (config.onDelete === 'cascade') {
          parts.push(`ON DELETE CASCADE`);
        } else if (config.onDelete === 'restrict') {
          parts.push(`ON DELETE RESTRICT`);
        } else {
          //
        }
      }
    }

    return parts.join(' ');
  });

  return `CREATE TABLE ${table.getName()} (\n${columns.join(`,\n`)}\n)`;
};
