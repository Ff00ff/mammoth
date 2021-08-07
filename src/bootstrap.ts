import { DbConfig } from './config';
import { makeDefineDb } from './db';

export const bootstrap = <Config extends DbConfig>() => {
  return {
    defineDb: makeDefineDb<Config>(),
  };
};
