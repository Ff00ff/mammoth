import { PartialQuery } from './../query/partial';
import { ParameterToken, NoSpaceToken } from '../tokens';

export const days = (days: number) => {
  return new PartialQuery(new ParameterToken(`${days} days`), new NoSpaceToken(`::interval`));
};
