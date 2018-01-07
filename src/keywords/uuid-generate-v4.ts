import { Keyword } from ".";

export class UuidGenerateV4 extends Keyword {
  toSql() { return `uuid_generate_v4()`; }
}