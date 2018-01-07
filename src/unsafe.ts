import { StringToken } from "./tokens";

export class Unsafe {
  private sql: string;

  constructor(sql: string) {
    this.sql = sql;
  }

  toTokens() {
    return [
      new StringToken(this.sql),
    ];
  }
}