import { StringToken } from './../../tokens';
import { Keyword } from '../../keywords';

export class UuidGenerateV4 extends Keyword {
  toTokens() {
    return [new StringToken(`uuid_generate_v4()`)];
  }
}
