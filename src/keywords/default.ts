import { Keyword } from ".";

export class Default extends Keyword {
  toSql() { return `DEFAULT`; }
}