import { Keyword } from '../keywords';

export class Default extends Keyword {
  toSql() {
    return `DEFAULT`;
  }
}
