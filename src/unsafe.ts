export class Unsafe {
  private sql: string;

  constructor(sql: string) {
    this.sql = sql;
  }

  toString(): string {
    return this.sql;
  }
}