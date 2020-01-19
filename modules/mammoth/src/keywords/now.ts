import { Keyword } from '../keywords';

export class Now extends Keyword {
  toSql() {
    return `NOW()`;
  }
}
