import { Keyword } from '../../keywords';

export class GenRandomUuid extends Keyword {
  toSql() {
    return `gen_random_uuid()`;
  }
}
