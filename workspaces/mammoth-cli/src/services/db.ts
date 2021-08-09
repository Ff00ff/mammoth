// TODO: the below interface will be available in mammoth at some point import { ColumnDefinitionFormat } from "@ff00ff/mammoth";
interface ColumnDefinitionFormat {
  dataType: string;
  isNotNull: boolean;
  isPrimaryKey: boolean;
  defaultExpression?: string;
  checkExpression?: string;
  isUnique: boolean;
  referencesTable?: {};
  referencesSelf?: boolean;
  referencesColumn?: string;
}

export interface Db {
  getTableDefinitions(): {
    name: string;
    originalDefinition: {};
    columns: (ColumnDefinitionFormat & { name: string })[];
  }[];
}

export type Table = ReturnType<Db['getTableDefinitions']>[number];
