import * as parser from '@pgql/parse';

interface RelationClause {
  RangeVar: {
    relname: string;
  };
}

interface StringSqlValue {
  String: {
    str: string;
  };
}

interface IntegerSqlValue {
  Integer: {
    ival: number;
  };
}

interface TypeNameSqlValue {
  TypeName: {
    names: SqlValue[];
  };
}

type SqlValue = StringSqlValue | IntegerSqlValue | TypeNameSqlValue;

const toString = (value: SqlValue): string => {
  if ('String' in value) {
    return value.String.str;
  }

  if ('Integer' in value) {
    return `${value.Integer.ival}`;
  }

  if ('TypeName' in value) {
    return value.TypeName.names.map((name) => toString(name)).join('.');
  }

  throw new Error(`Could not convert ConstValue to string '${value}'`);
};

const toSql = (expression: RawExpression): string => {
  if ('FuncCall' in expression) {
    return `${expression.FuncCall.funcname.map(toString).join('.')}(${
      expression.FuncCall.args?.map(toSql).join(', ') || ''
    })`;
  }

  if ('A_Const' in expression) {
    return toString(expression.A_Const.val);
  }

  if ('ColumnRef' in expression) {
    // TODO: should we escape this and/or also use the optional name?
    return expression.ColumnRef?.fields.map(toString).join('.');
  }

  if ('A_Expr' in expression) {
    // TODO: how to decide when to add parens around an expression e.g. SELECT 1 * 2 + 3 vs SELECT 1 * (2 + 3)
    // seems to only group the A_Expr differently.
    return `${toSql(expression.A_Expr.lexpr)} ${expression.A_Expr.name
      .map(toString)
      .join('.')} ${toSql(expression.A_Expr.rexpr)}`;
  }

  if ('TypeCast' in expression) {
    return `${toSql(expression.TypeCast.arg)}::${expression.TypeCast.typeName.TypeName.names
      .map(toString)
      .join('.')}`;
  }

  throw new Error(`Could not convert expression to SQL: ${JSON.stringify(expression, null, 2)}`);
};

interface FuncCallExpression {
  FuncCall: {
    funcname: SqlValue[];
    args?: RawExpression[];
  };
}

interface ConstExpression {
  A_Const: {
    val: SqlValue;
  };
}

interface ColumnRefExpression {
  ColumnRef: {
    fields: SqlValue[];
  };
}

interface LeftRightExpression {
  A_Expr: {
    name: SqlValue[];
    lexpr: RawExpression;
    rexpr: RawExpression;
  };
}

interface TypeCastExpression {
  TypeCast: {
    arg: RawExpression;
    typeName: {
      TypeName: {
        names: SqlValue[];
      };
    };
  };
}

type RawExpression =
  | TypeCastExpression
  | LeftRightExpression
  | ColumnRefExpression
  | ConstExpression
  | FuncCallExpression;

interface TableElementCheckConstraint {
  contype: 4;
  raw_expr: RawExpression;
  conname?: string;
}

interface TableElementDefaultConstraint {
  contype: 2;
  raw_expr: RawExpression;
}

interface TableElementPrimaryKeyConstraint {
  contype: 5;
  conname?: string;
  keys?: SqlValue[];
}

interface TableElementUniqueConstraint {
  contype: 6;
  keys?: SqlValue[];
  conname?: string;
}

interface TableElementNotNullConstraint {
  contype: 1;
}

type TableElementReferencesAction = 'a' | 'r' | 'c' | 'd' | 'n';

interface TableElementReferencesConstraint {
  contype: 8;
  conname?: string;
  pktable: {
    RangeVar: {
      relname: string;
    };
  };
  pk_attrs: SqlValue[];
  fk_attrs?: SqlValue[];
  fk_matchtype: 's' | 'f' | 'p';
  fk_upd_action: TableElementReferencesAction;
  fk_del_action: TableElementReferencesAction;
  initially_valid: boolean;
}

type TableElementConstraint =
  | TableElementReferencesConstraint
  | TableElementNotNullConstraint
  | TableElementDefaultConstraint
  | TableElementPrimaryKeyConstraint
  | TableElementUniqueConstraint
  | TableElementCheckConstraint;

interface TableElement {
  ColumnDef?: {
    colname: string;
    typeName: {
      TypeName: {
        names: SqlValue[];
      };
    };
    constraints?: {
      Constraint: TableElementConstraint;
    }[];
  };
  Constraint?: TableElementConstraint;
}

interface CreateStmt {
  relation: RelationClause;
  tableElts: TableElement[];
  if_not_exists?: boolean;
}

interface DropStmt {
  objects: SqlValue[][];
  missing_ok?: boolean;
  removeType: 37 | 45 | 19; // 37 = table, 45 = type, 19 = function
}

interface AlterTableAddColumnCmd {
  subtype: 0;
  def: {
    ColumnDef: TableElement['ColumnDef'];
  };
}
interface AlterTableDropColumnCmd {
  subtype: 10;
  name: string;
}
interface AlterTableAlterColumnAlterDefaultCmd {
  subtype: 3;
  name: string;
  def?: RawExpression;
}
interface AlterTableAlterColumnSetNotNullCmd {
  subtype: 5;
  name: string;
}
interface AlterTableAlterColumnDropNotNullCmd {
  subtype: 4;
  name: string;
}
interface AlterTableAlterColumnSetDataTypeCmd {
  subtype: 25;
  name: string;
  def: {
    ColumnDef: {
      typeName: {
        TypeName: {
          names: SqlValue[];
        };
      };
    };
  };
}

interface AlterTableAddConstraintCmd {
  subtype: 14;
  def: {
    Constraint: TableElementConstraint;
  };
}

interface AlterTableDropConstraintCmd {
  subtype: 22;
  name: string;
}

type AlterTableCmd =
  | AlterTableAlterColumnSetNotNullCmd
  | AlterTableAlterColumnDropNotNullCmd
  | AlterTableAddColumnCmd
  | AlterTableAlterColumnSetDataTypeCmd
  | AlterTableAlterColumnAlterDefaultCmd
  | AlterTableDropColumnCmd
  | AlterTableAddConstraintCmd
  | AlterTableDropConstraintCmd;

interface RenameTableStmt {
  renameType: 37;
  relation: {
    RangeVar: {
      relname: string;
    };
  };
  newname: string;
}

interface RenameColumnStmt {
  renameType: 6;
  relation: {
    RangeVar: {
      relname: string;
    };
  };
  subname: string;
  newname: string;
}
type RenameStmt = RenameTableStmt | RenameColumnStmt;
interface AlterTableStmt {
  relation: {
    RangeVar: {
      relname: string;
    };
  };
  cmds: {
    AlterTableCmd: AlterTableCmd;
  }[];
}

interface VariableSetStmt {
  kind: 0;
  name: string;
  args: RawExpression[];
}

interface CreateEnumStmt {
  typeName: SqlValue[];
  vals: SqlValue[];
}

interface AlterEnumStmt {
  typeName: SqlValue[];
  newVal: string;
  newValNeighbor: string;
  newValIsAfter: boolean;
}

type Stmt =
  | { CreateExtensionStmt: {} }
  | { CopyStmt: {} }
  | { ViewStmt: {} }
  | { CreateSchemaStmt: {} }
  | { IndexStmt: {} }
  | { AlterEnumStmt: AlterEnumStmt }
  | { CreateEnumStmt: CreateEnumStmt }
  | { VariableSetStmt: VariableSetStmt }
  | { AlterTableStmt: AlterTableStmt }
  | { RenameStmt: RenameStmt }
  | { DropStmt: DropStmt }
  | { CreateStmt: CreateStmt }
  | { SelectStmt: {} }
  | { DeleteStmt: {} }
  | { TruncateStmt: {} }
  | { UpdateStmt: {} }
  | { InsertStmt: {} }
  | { CreateFunctionStmt: {} };

interface Result {
  RawStmt: {
    stmt: Stmt;
  };
}

type TableAction = 'NO_ACTION' | 'RESTRICT' | 'CASCADE' | 'SET_NULL' | 'SET_DEFAULT';

export interface Column {
  name: string;
  dataType: string;
  constraints: TableConstraint[];
}

export interface Table {
  name: string;
  columns: Column[];
  constraints: TableConstraint[];
}

export interface TableNotNullConstraint {
  type: 'NOT_NULL';
  name?: never;
}

export interface TablePrimaryKeyConstraint {
  type: 'PRIMARY_KEY';
  keys?: string[];
  name?: never;
}

export interface TableDefaultConstraint {
  type: 'DEFAULT';
  expression: string;
  name?: never;
}

export interface TableCheckConstraint {
  type: 'CHECK';
  expression: string;
  name: string | undefined;
}

export interface TableUniqueConstraint {
  type: 'UNIQUE';
  keys?: string[];
  name: string | undefined;
}

export interface TableReferencesConstraint {
  type: 'REFERENCES';
  onDelete: TableAction;
  onUpdate: TableAction;
  match: 'FULL' | 'PARTIAL' | 'SIMPLE';
  columns?: string[]; // This makes it a foreign key constraint instead of references
  refTable: string;
  refColumns: string[];
  name: string | undefined;
}

export type TableConstraint =
  | TableNotNullConstraint
  | TablePrimaryKeyConstraint
  | TableDefaultConstraint
  | TableCheckConstraint
  | TableUniqueConstraint
  | TableReferencesConstraint;

interface EnumType {
  name: string;
  values: string[];
}

/**
 * This simulator accepts DDL statements such as CREATE TABLE, ALTER TABLE, etc and builds up the
 * given tables, columns and types. Internally, it uses the actual postgres query parser.
 */
export class DataDefinitionLanguageSimulator {
  private tables: { [tableName: string]: Table } = {};
  private types: { [typeName: string]: EnumType } = {};

  private toConstraint(constraint: TableElementConstraint): TableConstraint {
    if (constraint.contype == 1) {
      return {
        type: 'NOT_NULL',
      };
    } else if (constraint.contype == 2) {
      return {
        type: `DEFAULT`,
        expression: toSql(constraint.raw_expr),
      };
    } else if (constraint.contype == 4) {
      //

      return {
        type: `CHECK`,
        expression: toSql(constraint.raw_expr),
        name: constraint.conname,
      };
    } else if (constraint.contype == 5) {
      return {
        type: `PRIMARY_KEY`,
        keys: constraint.keys?.map(toString) || [],
      };
    } else if (constraint.contype == 6) {
      return {
        type: `UNIQUE`,
        keys: constraint.keys?.map(toString) || [],
        name: constraint.conname,
      };
    } else if (constraint.contype == 8) {
      const actions: {
        [K in TableElementReferencesAction]: TableAction;
      } = {
        a: `NO_ACTION`,
        r: `RESTRICT`,
        c: `CASCADE`,
        d: `SET_DEFAULT`,
        n: `SET_NULL`,
      };

      const matches: {
        [K in 's' | 'f' | 'p']: 'FULL' | 'PARTIAL' | 'SIMPLE';
      } = {
        s: 'SIMPLE',
        f: 'FULL',
        p: 'PARTIAL',
      };

      return {
        type: `REFERENCES`,
        onDelete: actions[constraint.fk_del_action],
        onUpdate: actions[constraint.fk_upd_action],
        match: matches[constraint.fk_matchtype],
        refTable: constraint.pktable.RangeVar.relname,
        refColumns: constraint.pk_attrs.map(toString),
        columns: constraint.fk_attrs?.map(toString) || [],
        name: constraint.conname,
      };
    }

    return constraint;
  }

  private parseRenameStatement(statement: RenameStmt): void {
    if (statement.renameType == 6) {
      const table = this.tables[statement.relation.RangeVar.relname];

      if (!table) {
        throw new Error(
          `Table '${statement.relation.RangeVar.relname}' could not be found when trying to rename column '${statement.subname}' to '${statement.newname}'.`,
        );
      }

      const column = table.columns.find((column) => column.name === statement.subname);

      if (!column) {
        throw new Error(
          `Could not find column '${statement.subname}' in table '${table.name}' when trying to rename to '${statement.newname}'.`,
        );
      }

      column.name = statement.newname;
      return;
    } else if (statement.renameType === 37) {
      const table = this.tables[statement.relation.RangeVar.relname];

      if (!table) {
        throw new Error(
          `Table '${statement.relation.RangeVar.relname}' could not be found when trying to rename to '${statement.newname}'.`,
        );
      }

      if (this.tables[statement.newname]) {
        throw new Error(
          `Could not rename table '${statement.relation.RangeVar.relname}' to '${statement.newname}' because it already exists.`,
        );
      }

      table.name = statement.newname;
      delete this.tables[statement.relation.RangeVar.relname];
      this.tables[table.name] = table;
      return;
    }

    return statement;
  }

  private parseCreateStatement(statement: CreateStmt) {
    const table: Table = {
      name: statement.relation.RangeVar.relname,
      columns: statement.tableElts
        .filter((element) => element.ColumnDef)
        .map((element) => {
          const columnDef = element.ColumnDef!;
          const name = columnDef.colname;
          const dataType = columnDef.typeName.TypeName.names.map(toString).join('.');

          const constraints =
            columnDef.constraints?.map(({ Constraint: constraint }) =>
              this.toConstraint(constraint),
            ) || [];

          return {
            name,
            dataType,
            constraints,
          };
        }),
      constraints: statement.tableElts
        .filter((element) => element.Constraint)
        .map(({ Constraint: constraint }) => this.toConstraint(constraint!)),
    };

    if (this.tables[table.name] && !statement.if_not_exists) {
      throw new Error(`Table '${table.name}' already exists`);
    }

    this.tables[table.name] = table;
  }

  private parseDropStatement(statement: DropStmt): void {
    if (statement.removeType === 37) {
      statement.objects.forEach((objects) => {
        const name = toString(objects[objects.length - 1]);

        const table = this.tables[name];

        if (!table && !statement.missing_ok) {
          throw new Error(`Could not drop table '${name}' because it does not exist.`);
        }

        // TODO: if there is a cascade clause we need to drop everything related
        delete this.tables[name];
      });
    } else if (statement.removeType === 45) {
      statement.objects.forEach((objects) => {
        const name = toString(objects[objects.length - 1]);
        const type = this.types[name];

        if (!type && !statement.missing_ok) {
          throw new Error(`Could not drop type '${name}' because it does not exist.`);
        }

        delete this.types[name];
      });
    } else if (statement.removeType === 19) {
      // TODO: drop the function
    } else {
      return statement.removeType;
    }
  }

  private parseAlterTableStatement(statement: AlterTableStmt) {
    const table = this.tables[statement.relation.RangeVar.relname];
    if (!table) {
      throw new Error(
        `Could not find table '${statement.relation.RangeVar.relname}' when altering table.`,
      );
    }

    statement.cmds.forEach((command): void => {
      if (command.AlterTableCmd.subtype === 0) {
        const constraints =
          command.AlterTableCmd.def.ColumnDef!.constraints?.map(({ Constraint: constraint }) =>
            this.toConstraint(constraint),
          ) || [];
        const dataType = command.AlterTableCmd.def
          .ColumnDef!.typeName.TypeName.names.map(toString)
          .join('.');

        table.columns.push({
          name: command.AlterTableCmd.def.ColumnDef!.colname,
          constraints,
          dataType,
        });
      } else if (command.AlterTableCmd.subtype === 5) {
        const columnName = command.AlterTableCmd.name;
        const column = table.columns.find((column) => column.name === columnName);
        if (!column) {
          throw new Error(
            `Could not find column '${columnName}' to alter default in table '${table.name}'.`,
          );
        }

        column.constraints.push({
          type: `NOT_NULL`,
        });
      } else if (command.AlterTableCmd.subtype === 4) {
        const columnName = command.AlterTableCmd.name;
        const column = table.columns.find((column) => column.name === columnName);
        if (!column) {
          throw new Error(
            `Could not find column '${columnName}' to alter not null in table '${table.name}'.`,
          );
        }

        const constraintIndex = column.constraints.findIndex(
          (constraint) => constraint.type === `NOT_NULL`,
        );

        if (constraintIndex === -1) {
          throw new Error(
            `Could not drop not null from column '${column.name}' because not null was not set`,
          );
        }

        column.constraints.splice(constraintIndex, 1);
      } else if (command.AlterTableCmd.subtype === 25) {
        const columnName = command.AlterTableCmd.name;
        const column = table.columns.find((column) => column.name === columnName);
        if (!column) {
          throw new Error(
            `Could not find column '${columnName}' to set data type in table '${table.name}'.`,
          );
        }

        const dataType = command.AlterTableCmd.def.ColumnDef.typeName.TypeName.names
          .map(toString)
          .join('.');
        column.dataType = dataType;
      } else if (command.AlterTableCmd.subtype === 3) {
        const columnName = command.AlterTableCmd.name;
        const column = table.columns.find((column) => column.name === columnName);
        if (!column) {
          throw new Error(
            `Could not find column '${columnName}' to alter default in table '${table.name}'.`,
          );
        }

        if (command.AlterTableCmd.def) {
          column.constraints.push({
            type: `DEFAULT`,
            expression: toSql(command.AlterTableCmd.def),
          });
        } else {
          const constraintIndex = column.constraints.findIndex(
            (constraint) => constraint.type === `DEFAULT`,
          );
          column.constraints.splice(constraintIndex, 1);
        }
      } else if (command.AlterTableCmd.subtype === 10) {
        const columnName = command.AlterTableCmd.name;
        const columnIndex = table.columns.findIndex((column) => column.name === columnName);
        if (columnIndex === -1) {
          throw new Error(
            `Could not find column '${columnName}' to drop in table '${table.name}'.`,
          );
        }

        table.columns.splice(columnIndex, 1);
      } else if (command.AlterTableCmd.subtype === 14) {
        const newConstraint = this.toConstraint(command.AlterTableCmd.def.Constraint);

        table.constraints.push(newConstraint);
      } else if (command.AlterTableCmd.subtype === 22) {
        const constraintName = command.AlterTableCmd.name;
        const constraintIndex = table.constraints.findIndex(
          (constraint) => constraint.name === constraintName,
        );

        if (!constraintIndex) {
          // TODO: find the constraint matching the name
          // index.name = constraintName || `${table.name}_${index.columns.join(`_`)}_fkey`;
          // pkey for primary key, key for unique
          // FIXME: the CHECK is actually named based on the expression. If it references one
          // column it's added to the name. We can't just check if one of the columns is in
          // the expression, because it checks if it's really a reference.
          //
          // Some examples:
          //  "test_check" CHECK (1 > 0) -- no column
          //  "test_check1" CHECK (123 > 0) -- no column, second check
          //  "test_check2" CHECK (foo_id > val) -- multiple columns, third check
          //  "test_val_check" CHECK (length('foo_id'::text) > val) -- column as string and real reference
          //  "test_val_check1" CHECK (1 > val AND val < 0) -- one column multiple references
        } else {
          table.constraints.splice(constraintIndex, 1);
        }
      } else {
        throw new Error(
          `Could not simulate alter table command '${JSON.stringify(command.AlterTableCmd)}'`,
        );
      }
    });
  }

  private parseCreateEnumStatement(statement: CreateEnumStmt) {
    const values = statement.vals.map(toString);
    const name = statement.typeName.map(toString).join('.');

    this.types[name] = {
      name,
      values,
    };
  }

  private parseAlterEnumStatement(statement: AlterEnumStmt) {
    const name = statement.typeName.map(toString).join('.');
    const type = this.types[name];

    if (!type) {
      throw new Error(
        `Could not alter type '${name}' when trying to add value '${statement.newVal}'.`,
      );
    }

    const index = type.values.indexOf(statement.newValNeighbor);

    if (index === -1) {
      throw new Error(
        `Could not find value '${statement.newValNeighbor}' when adding '${statement.newVal}' to type '${type.name}'`,
      );
    }

    const newValueIndex = statement.newValIsAfter ? index + 1 : index;
    type.values.splice(newValueIndex, 0, statement.newVal);
  }

  private parseStatement(statement: Stmt) {
    if (
      'SelectStmt' in statement ||
      'DeleteStmt' in statement ||
      'TruncateStmt' in statement ||
      'UpdateStmt' in statement ||
      'InsertStmt' in statement ||
      'CopyStmt' in statement ||
      'VariableSetStmt' in statement ||
      'CreateExtensionStmt' in statement ||
      'IndexStmt' in statement
    ) {
      // These statements are not considered data definition altering statements.
      return false;
    }

    if (
      'CreateFunctionStmt' in statement ||
      'ViewStmt' in statement ||
      'CreateSchemaStmt' in statement
    ) {
      // These statements are currently not supported yet. TODO: how to log using oclif?
      return false;
    }

    if ('CreateStmt' in statement) {
      return this.parseCreateStatement(statement.CreateStmt);
    } else if ('CreateEnumStmt' in statement) {
      return this.parseCreateEnumStatement(statement.CreateEnumStmt);
    } else if ('AlterTableStmt' in statement) {
      return this.parseAlterTableStatement(statement.AlterTableStmt);
    } else if ('RenameStmt' in statement) {
      return this.parseRenameStatement(statement.RenameStmt);
    } else if ('DropStmt' in statement) {
      return this.parseDropStatement(statement.DropStmt);
    } else if ('AlterEnumStmt' in statement) {
      return this.parseAlterEnumStatement(statement.AlterEnumStmt);
    } else {
      throw new Error(
        `Found unknown statement when parsing queries: ${JSON.stringify(statement, null, 2)}`,
      );
    }
  }

  parse(sql: string) {
    const result: Result[] = parser.parseQuerySync(sql);

    result.forEach((result) => {
      this.parseStatement(result.RawStmt.stmt);
    });
  }

  getTables() {
    return this.tables;
  }
}
