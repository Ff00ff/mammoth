type RowActionType = 'restrict' | 'cascade' | 'no action';
interface ColumnConfig {
  primary?: boolean;
  default?: string;
  check?: string;
  notNull?: boolean;
  unique?: boolean;
  references?: {
    tableName: string;
    columnName: string;
  };
  onDelete?: RowActionType;
  onUpdate?: RowActionType;
}

interface Column {
  dataType?: string;
  enumValues?: string[];
  config: ColumnConfig;
  snakeCaseName: string;
}

interface TableWrapper {
  columns: Column[];
  name: string;
}

// TODO: We could also immediately generate the AST from here?

export const generateSql = (table: TableWrapper) => {
  return [...generateTypeSql(table), generateCreateTableSql(table)];
};

export const generateTypeSql = (table: TableWrapper) => {
  //

  return table.columns
    .filter(column => column.enumValues !== undefined)
    .map(column => {
      if (!column.dataType) {
        column.dataType = `${table.name}_${column.snakeCaseName}_ENUM`.toUpperCase();
      }

      return `CREATE TYPE ${column.dataType} AS ENUM (${column
        .enumValues!.map((value: string) => `'${value}'`)
        .join(`, `)})`;
    });
};

export const generateCreateTableSql = (table: TableWrapper) => {
  const columns = table.columns.map(column => {
    const config = column.config;

    const parts = [
      `  ${column.snakeCaseName}`,

      // TODO: it's probably nicer to have a function here so once we refactor the original column
      // out of the column wrapper this still works.
      column.dataType,
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

  return `CREATE TABLE ${table.name} (\n${columns.join(`,\n`)}\n)`;
};
