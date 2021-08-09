import {
  Column,
  DataDefinitionLanguageSimulator,
  Table,
  TableCheckConstraint,
  TableConstraint,
  TableDefaultConstraint,
  TableNotNullConstraint,
  TableReferencesConstraint,
} from './data-definition-language-simulator';

const getTables = (tables: { [tableName: string]: Table }) =>
  Object.keys(tables).map((tableName) => tables[tableName] as Table);

const getColumnSql = (column: Column) => {
  let query = `${column.name} ${column.dataType}`;

  column.constraints.forEach((constraint) => {
    if (constraint.type === `PRIMARY_KEY`) {
      query += ` PRIMARY KEY`;
    } else if (constraint.type === `NOT_NULL`) {
      query += ` NOT NULL`;
    } else if (constraint.type === `CHECK`) {
      query += ` CHECK (${constraint.expression})`;
    } else if (constraint.type === `DEFAULT`) {
      query += ` DEFAULT ${constraint.expression}`;
    } else if (constraint.type === `REFERENCES`) {
      query += ` REFERENCES ${constraint.refTable} (${constraint.refColumns.join(`, `)})`;

      // TODO: add on update, on delete table actions
    } else if (constraint.type === `UNIQUE`) {
      query += ` UNIQUE`;
    }
  });

  return query;
};

const isEqualColumn = (fromColumn: Column | undefined, toColumn: Column | undefined): boolean => {
  if (
    !fromColumn ||
    !toColumn ||
    fromColumn.dataType !== toColumn.dataType ||
    fromColumn.constraints.length !== toColumn.constraints.length
  ) {
    return false;
  }

  // TODO: we should really sort the constraints if we're going to assume we can do something like
  // the below.
  return fromColumn.constraints.every((fromConstraint, index) => {
    const toConstraint = toColumn.constraints[index];

    if (fromConstraint.type !== toConstraint.type || fromConstraint.name !== toConstraint.name) {
      return false;
    }

    if (fromConstraint.type === `DEFAULT`) {
      return fromConstraint.expression === (toConstraint as TableDefaultConstraint).expression;
    } else if (fromConstraint.type === `CHECK`) {
      return fromConstraint.expression === (toConstraint as TableCheckConstraint).expression;
    } else if (fromConstraint.type === `REFERENCES`) {
      return (
        fromConstraint.refTable === (toConstraint as TableReferencesConstraint).refTable &&
        fromConstraint.match === (toConstraint as TableReferencesConstraint).match &&
        fromConstraint.onDelete === (toConstraint as TableReferencesConstraint).onDelete &&
        fromConstraint.onUpdate === (toConstraint as TableReferencesConstraint).onUpdate &&
        fromConstraint.refColumns.length ===
          (toConstraint as TableReferencesConstraint).refColumns.length &&
        fromConstraint.refColumns.every(
          (refColumn, i) => (toConstraint as TableReferencesConstraint).refColumns[i] === refColumn,
        )
      );
    }

    return true;
  });
};

const isEqualTable = (fromTable: Table, toTable: Table) =>
  fromTable.columns.length === toTable.columns.length &&
  fromTable.columns.every((fromColumn, index) => {
    const toColumn = toTable.columns[index];

    return isEqualColumn(fromColumn, toColumn) && fromColumn.name === toColumn.name;
  });

interface Query {
  name?: string;
  text: string;
  dependencies: string[];
}

export const createSql = (
  from: DataDefinitionLanguageSimulator,
  to: DataDefinitionLanguageSimulator,
) => {
  const tab = '  ';
  const queries: Query[] = [];
  const toTables = to.getTables();
  const fromTables = from.getTables();

  getTables(toTables).forEach((toTable) => {
    const fromTable = fromTables[toTable.name];

    if (!fromTable) {
      const tables = getTables(fromTables).filter((fromTable) => isEqualTable(fromTable, toTable));
      if (tables.length === 1 && !toTables[tables[0].name]) {
        const table = tables[0];
        const query = `ALTER TABLE ${table.name} RENAME TO ${toTable.name}`;
        from.parse(query);
        queries.push({
          text: query,
          dependencies: [],
        });
      } else {
        const query = `CREATE TABLE ${toTable.name} (\n${toTable.columns
          .map((column) => `${tab}${getColumnSql(column)}`)
          .join(`,\n`)}\n)`;

        from.parse(query);

        queries.push({
          name: toTable.name,
          text: query,
          dependencies: toTable.constraints
            .filter((constraint) => constraint.type === 'REFERENCES')
            .map((constraint) => (constraint as TableReferencesConstraint).refTable),
        });
      }
    } else {
      toTable.columns.forEach((toColumn) => {
        const fromColumn = fromTable.columns.find((column) => column.name === toColumn.name);

        if (!fromColumn) {
          const equalColumns = fromTable.columns.filter((column) =>
            isEqualColumn(column, toColumn),
          );
          const equalColumn = equalColumns[0];

          if (
            equalColumns.length === 1 &&
            !toTable.columns.find((column) => column.name === equalColumn.name)
          ) {
            const query = `ALTER TABLE ${toTable.name} RENAME COLUMN ${equalColumn.name} TO ${toColumn.name}`;
            from.parse(query);

            queries.push({
              text: query,
              dependencies: [],
            });
          } else {
            const query = `ALTER TABLE ${toTable.name} ADD COLUMN ${getColumnSql(toColumn)}`;
            from.parse(query);

            queries.push({
              text: query,
              dependencies: [],
            });
          }
        } else {
          if (fromColumn.dataType !== toColumn.dataType) {
            const query = `ALTER TABLE ${toTable.name} ALTER COLUMN ${toColumn.name} SET DATA TYPE ${toColumn.dataType}`;
            from.parse(query);

            queries.push({
              text: query,
              dependencies: [],
            });
          }

          const isNotNull = (constraint: TableConstraint) => constraint.type === `NOT_NULL`;
          const isDefault = (constraint: TableConstraint) => constraint.type === `DEFAULT`;

          const fromNotNull = fromColumn.constraints.find(isNotNull) as
            | TableNotNullConstraint
            | undefined;
          const toNotNull = toColumn.constraints.find(isNotNull) as
            | TableNotNullConstraint
            | undefined;

          if (fromNotNull && !toNotNull) {
            const query = `ALTER TABLE ${toTable.name} ALTER COLUMN ${toColumn.name} DROP NOT NULL`;
            from.parse(query);

            queries.push({
              text: query,
              dependencies: [],
            });
          } else if (!fromNotNull && toNotNull) {
            const query = `ALTER TABLE ${toTable.name} ALTER COLUMN ${toColumn.name} SET NOT NULL`;
            from.parse(query);

            queries.push({
              text: query,
              dependencies: [],
            });
          }

          const fromDefault = fromColumn.constraints.find(isDefault) as
            | TableDefaultConstraint
            | undefined;
          const toDefault = fromColumn.constraints.find(isDefault) as
            | TableDefaultConstraint
            | undefined;

          if (fromDefault && !toDefault) {
            const query = `ALTER TABLE ${toTable.name} ALTER COLUMN ${toColumn.name} DROP DEFAULT`;
            from.parse(query);

            queries.push({
              text: query,
              dependencies: [],
            });
          } else if (!fromDefault && toDefault) {
            const query = `ALTER TABLE ${toTable.name} ALTER COLUMN ${toColumn.name} SET DEFAULT ${toDefault.expression}`;
            from.parse(query);

            queries.push({
              text: query,
              dependencies: [],
            });
          } else if (fromDefault && toDefault && fromDefault.expression !== toDefault.expression) {
            const query = `ALTER TABLE ${toTable.name} ALTER COLUMN ${toColumn.name} SET DEFAULT ${toDefault.expression}`;
            from.parse(query);

            queries.push({
              text: query,
              dependencies: [],
            });
          }

          // TODO: also support the flow to add or drop primary key, check and unique.
        }
      });

      const fromColumns = [...fromTable.columns];

      fromColumns.forEach((fromColumn) => {
        const toColumn = toTable.columns.find((column) => column.name === fromColumn.name);

        if (!toColumn) {
          const query = `ALTER TABLE ${toTable.name} DROP COLUMN ${fromColumn.name}`;
          from.parse(query);

          queries.push({
            text: query,
            dependencies: [],
          });
        }
      });

      // TODO: and drop or add constraints on table level
    }
  });

  const dropQueries: string[] = [];
  getTables(fromTables).forEach((fromTable) => {
    const toTable = toTables[fromTable.name];

    if (!toTable) {
      const query = `DROP TABLE ${fromTable.name}`;
      dropQueries.push(query);
      queries.push({
        name: fromTable.name,
        text: query,
        dependencies: getTables(fromTables)
          // TODO: we should probably also check the constraints on column level, or move all
          // constraints to table level to make this easier.
          .filter((table) =>
            table.constraints.find(
              (constraint) =>
                constraint.type === 'REFERENCES' && constraint.refTable === fromTable.name,
            ),
          )
          .map((table) => table.name),
      });
    }
  });
  dropQueries.forEach((dropQuery) => from.parse(dropQuery));

  // TODO: create type, alter type and drop type

  return queries
    .sort((a, b) => {
      if (a.name && b.name) {
        if (a.dependencies.indexOf(b.name) !== -1) {
          return 1;
        } else if (b.dependencies.indexOf(a.name) !== -1) {
          return -1;
        }

        return a.dependencies.length - b.dependencies.length;
      }

      return 0;
    })
    .map((query) => `${query.text};`);
};
