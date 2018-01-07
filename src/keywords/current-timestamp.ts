import { Keyword } from ".";

export class CurrentTimestamp extends Keyword {
  toSql() { return `CURRENT_TIMESTAMP`; }
}