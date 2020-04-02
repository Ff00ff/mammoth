import {
  CitextColumn,
  Column,
  DateColumn,
  DecimalColumn,
  IntegerColumn,
  JSONBColumn,
  JSONColumn,
  SerialColumn,
  TextColumn,
  TimeColumn,
  TimestampColumn,
  TimestampWithTimeZoneColumn,
  TimestampWithoutTimeZoneColumn,
  UuidColumn,
} from '.';

export const dataType = <T>(dataType: string) => new Column<T>(dataType);
export const uuid = () => new UuidColumn();
export const text = <T = string>() => new TextColumn<T>();
export const citext = () => new CitextColumn();
export const caseInsensitiveText = () => new CitextColumn();
export const integer = () => new IntegerColumn();
export const decimal = () => new DecimalColumn();
export const serial = () => new SerialColumn();
export const json = () => new JSONColumn();
export const jsonb = () => new JSONBColumn();
export const timestampWithTimeZone = () => new TimestampWithTimeZoneColumn();
export const timestamptz = () => new TimestampWithTimeZoneColumn();
export const timestampWithoutTimeZone = () => new TimestampWithoutTimeZoneColumn();
export const timestamp = () => new TimestampColumn();
export const date = () => new DateColumn();
export const time = () => new TimeColumn();
