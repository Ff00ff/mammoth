import { makeColumnDefinition } from './column';

export const dataType = <T>(dataType: string) => makeColumnDefinition<T, false, false>(dataType);
export const uuid = () => makeColumnDefinition<string, false, false>(`uuid`);
export const text = () => makeColumnDefinition<string, false, false>(`text`);
export const integer = () => makeColumnDefinition<number, false, false>(`integer`);
export const timestampWithTimeZone = () =>
  makeColumnDefinition<Date, false, false>(`timestamp with time zone`);
export const timestamptz = () =>
  makeColumnDefinition<Date, false, false>(`timestamp with time zone`);
export const boolean = () => makeColumnDefinition<boolean, false, false>(`boolean`);
export const citext = () => makeColumnDefinition<string, false, false>(`citext`);
export const caseInsensitiveText = () => makeColumnDefinition<string, false, false>(`citext`);

export const decimal = () => makeColumnDefinition<number, false, false>(`decimal`);
export const serial = () => makeColumnDefinition<number, false, false>(`serial`);
export const bigserial = () => makeColumnDefinition<number, false, false>(`bigserial`);
export const smallserial = () => makeColumnDefinition<number, false, false>(`smallserial`);
export const json = <T = unknown>() => makeColumnDefinition<T, false, false>(`json`);
export const jsonb = <T = unknown>() => makeColumnDefinition<T, false, false>(`jsonb`);
export const timestampWithoutTimeZone = () =>
  makeColumnDefinition<Date, false, false>(`timestamp without time zone`);
export const timestamp = () => makeColumnDefinition<Date, false, false>(`timestamp`);
export const date = () => makeColumnDefinition<Date, false, false>(`date`);
export const time = () => makeColumnDefinition<Date, false, false>(`time`);
