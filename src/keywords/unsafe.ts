import { StringToken } from '../tokens';
import { Keyword } from '.';

export class Unsafe extends Keyword {
  private sql: string;

  constructor(sql: string) {
    super();

    this.sql = sql;
  }

  toTokens() {
    return [new StringToken(this.sql)];
  }
}
