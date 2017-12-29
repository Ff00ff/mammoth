export declare type IndexType = 'primaryKey' | 'foreignKey' | 'unique' | 'check';
export interface Index {
    type: IndexType;
    columns: string[];
    name?: string;
    tableName?: string;
    referenceColumns?: string[];
    expression?: string;
    parameters?: {
        key: string;
        value?: string;
    }[];
}
export interface Column {
    name: string;
    dataType: string;
    collation?: string;
    modifiers: {
        null?: boolean;
        notNull?: boolean;
        default?: string;
    };
}
export interface Type {
    type: 'enum';
    name: string;
    labels: string[];
}
export interface Table {
    name: string;
    columns: {
        [columnName: string]: Column | undefined;
    };
    indexes: Index[];
}
export interface TableMap {
    [tableName: string]: Table | undefined;
}
export interface TypeMap {
    [typeName: string]: Type | undefined;
}
export default class Simulator {
    input?: string;
    tables: TableMap;
    types: TypeMap;
    constructor(simulator?: Simulator);
    toJSON(): {
        tables: TableMap;
        types: TypeMap;
    };
    findByRegExp(regexp: RegExp): string | undefined;
    getToken(expectedTokens: string[]): string;
    findToken(expectedTokens: string[]): string | undefined;
    optionalToken(expectedTokens: string[]): boolean;
    ifToken(expectedTokens: string[], ifCallback: (token: string) => void, elseCallback?: () => void): boolean;
    getUntil(excludeTokens: string[]): string;
    getIdentifier(): string;
    getString(): string;
    getInScope(): string;
    getExpression(): string;
    scope(callback: () => string | undefined): string | undefined;
    repeat(callback: () => void): void;
    switchToken(map: {
        [index: string]: () => void;
    }): boolean;
    simulateDropType(): void;
    simulateDropTable(): void;
    simulateAlterType(): void;
    simulateAlterTable(): void;
    addIndex(table: Table, index: Index): void;
    getColumn(table: Table): {
        column: Column | undefined;
        indexes: Index[];
    };
    simulateCreateType(): void;
    simulateCreateTable(): void;
    simulateQuery(sql: string): void;
}
