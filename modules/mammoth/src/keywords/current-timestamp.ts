import { Keyword } from '../keywords';

export class CurrentTimestamp extends Keyword {
  toSql() {
    return `CURRENT_TIMESTAMP`;
  }
}
