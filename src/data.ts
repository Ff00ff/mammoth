// We store data we need of tables on this internal structure. The reason we do this is to avoid

import { Column } from "./column";
import { Table } from "./table";

// polluting the scope of the public API.
export const internalTableData: Map<Table<any, any>, TableData> = new Map();
export const internalColumnData: Map<any, ColumnData> = new Map();

interface TableData {
  name: string;
  originalName: string | undefined;
}

export const getTableData = (table: Table<any, any>) => {
  const tableData = internalTableData.get(table);

  if (!tableData) {
    throw new Error(`Could not find data for table '${table}'.`);
  }

  return tableData;
};

interface ColumnData {
  snakeCaseName: string;
}

export const getColumnData = (column: Column<any, any, any, any, any, any>) => {
  const columnData = internalColumnData.get(column);

  if (!columnData) {
    throw new Error(`Could not find data for column '${column}'.`);
  }

  return columnData;
};
