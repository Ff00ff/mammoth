import { Keyword } from ".";

export class Now extends Keyword {
  toSql() { return `NOW()`; }
}