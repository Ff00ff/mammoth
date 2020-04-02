import { PartialQuery } from './../query/partial';
import { StringToken } from './../tokens';

export class Now extends PartialQuery {
  constructor() {
    super(new StringToken(`NOW()`));
  }
}

export const now = () => new Now();
