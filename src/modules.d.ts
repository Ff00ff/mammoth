declare module 'pg-query-parser' {
  export enum ConstraintType {
    NONE = 0,
    NOT_NULL,
    DEFAULT,
    CHECK,
    PRIMARY_KEY,
    UNIQUE,
    UNKNOWN_1,
    REFERENCES,
  }

  export interface AlterTableStmt {
    relation: {
      RangeVar: {
        relname: string;
      };
    };
    cmds: {
      AlterTableCmd: {
        subtype: number; // 22 = drop constraint? 10 = drop column; 25 = alter column [set data type]; 3 = alter column set default
        name: string;
        behavior: number;
        def?: {
          // TODO: was this with key ColumnDef?
          ColumnDef: ColumnDef;
        };
      };
    }[];
    relkind: number; // 32 = table?
  }
  export interface RenameStmt {
    renameType: number; // 32 = table; 31 = constraint
    relationType: 0; // 0 = table
    relation: {
      RangeVar: {
        relname: string;
      };
    };
    subname?: string; // Old name in some cases
    newname: string;
  }
  export interface SelectStmt {
    // TODO: we're actually ignoring select statements so not annotating this one yet
  }
  export interface DropStmt {
    objects: {
      TypeName: {
        names: StringType[];
      };
    }[][];
  }
  export interface AlterEnumStmt {
    typeName: StringType[];
    newVal: string;
    newValNeighbor: string;
    newValIsAfter?: true;
  }
  export type Expression =
    | {
        FuncCall: {
          funcname: StringType[]; // Joined by dots? Includes default public schema?
          args?: Expression[];
        };
      }
    | {
        // This is some kind of compare expression
        A_Expr: {
          kind: 0;
          name: StringType[];
          lexpr: Expression;
          rexpr: Expression;
        };
      }
    | {
        A_Const: {
          val: IntegerType | StringType;
        };
      }
    | {
        ColumnRef: {
          fields: StringType[];
        };
      };
  export interface ColumnDef {
    colname: string;
    typeName: {
      TypeName: {
        names: StringType[];
      };
    };
    constraints?: {
      Constraint: {
        contype: ConstraintType;
        pktable?: {
          RangeVar: {
            relname: string; // Table name
          };
          pk_attrs: StringType[]; // Column names
          fk_matchtype: 's';
          fk_upd_action: 'a' | 'c' | 'r';
          fk_del_action: 'a' | 'c' | 'r';
          initially_valid: true;
        };
        fk_attrs?: StringType[]; // In case of FOREIGN KEY keyword
        keys?: StringType[]; // Multiple keys in case of multi column primary key or unique or whatever, or the columndef if exists
        raw_expr?: Expression;
      };
    }[];
  }
  export interface CreateStmt {
    relation: {
      RangeVar: {
        relname: string;
        relpersistence: 'p'; // TODO: is this switched when creating a temporary table?
      };
    };
    tableElts: {
      // In case of e.g. multi-column primary key the column is undefined and constraint is set
      ColumnDef?: ColumnDef;
    }[];
    if_not_exists?: true;
  }
  export interface StringType {
    String: {
      str: string;
    };
  }
  export interface IntegerType {
    Integer: {
      ival: number;
    };
  }
  export interface CreateEnumStmt {
    typeName: StringType[];
    vals: StringType[];
  }

  export type Query =
    | { SelectStmt: SelectStmt }
    | { AlterEnumStmt: AlterEnumStmt }
    | { DropStmt: DropStmt }
    | { CreateStmt: CreateStmt }
    | { CreateEnumStmt: CreateEnumStmt };

  export interface Result {
    query: Query[];
  }

  export function parse(sql: string): Result;
}
