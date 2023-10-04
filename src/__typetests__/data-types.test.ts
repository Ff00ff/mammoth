import {
    array,
    array2d,
    bigint,
    bigserial,
    bit,
    bitVarying,
    bool,
    boolean,
    box,
    bytea,
    caseInsensitiveText,
    char,
    character,
    characterVarying,
    cidr,
    circle,
    citext,
    date,
    decimal,
    defineDb,
    defineTable,
    doublePrecision,
    enumType,
    float4,
    float8,
    inet,
    int,
    int2,
    int4,
    int8,
    integer,
    interval,
    json,
    jsonb,
    line,
    lseg,
    macaddr,
    macaddr8,
    money,
    numeric,
    path,
    pgLsn,
    point,
    polygon,
    real,
    serial,
    serial2,
    serial4,
    serial8,
    smallint,
    smallserial,
    text,
    time,
    timeWithTimeZone,
    timeWithoutTimeZone,
    timestamp,
    timestampWithTimeZone,
    timestampWithoutTimeZone,
    timestamptz,
    tsquery,
    tsvector,
    txidSnapshot,
    uuid,
    varbit,
    varchar,
    xml,
} from '../../.build';

import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';
import { expectType} from 'tsd-lite';

const toSnap = <T extends Query<any>>(query: T): ResultSet<T> => {
    return undefined as any;
};

/** @dts-jest enable:test-type */

const foo = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    int8: int8(),
    bigint: bigint(),
    bigserial: bigserial(),
    serial8: serial8(),
    bit: bit(),
    bitVarying: bitVarying(),
    varbit: varbit(),
    boolean: boolean(),
    bool: bool(),
    box: box(),
    bytea: bytea(),
    character: character(),
    char: char(),
    characterVarying: characterVarying(),
    varchar: varchar(),
    circle: circle(),
    cidr: cidr(),
    caseInsensitiveText: caseInsensitiveText(),
    citext: citext(),
    date: date(),
    doublePrecision: doublePrecision(),
    float8: float8(),
    inet: inet(),
    decimal: decimal(),
    integer: integer(),
    int: int(),
    int4: int4(),
    interval: interval(),
    json: json(),
    jsonb: jsonb(),
    line: line(),
    lseg: lseg(),
    macaddr: macaddr(),
    macaddr8: macaddr8(),
    money: money(),
    numeric: numeric(),
    point: point(),
    path: path(),
    pgLsn: pgLsn(),
    polygon: polygon(),
    real: real(),
    float4: float4(),
    smallint: smallint(),
    int2: int2(),
    serial: serial(),
    serial4: serial4(),
    smallserial: smallserial(),
    serial2: serial2(),
    text: text(),
    time: time(),
    timeWithoutTimeZone: timeWithoutTimeZone(),
    timeWithTimeZone: timeWithTimeZone(),
    timestamp: timestamp(),
    timestamptz: timestamptz(),
    timestampWithoutTimeZone: timestampWithoutTimeZone(),
    timestampWithTimeZone: timestampWithTimeZone(),
    tsquery: tsquery(),
    tsvector: tsvector(),
    txidSnapshot: txidSnapshot(),
    uuid: uuid(),
    xml: xml(),
    enumType: enumType('my_enum-type', ['A', 'B', 'C'] as const),
    array: array(text()),
    array2d: array2d(text()),
});

const db = defineDb({ foo }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

describe('data-types', () => {
    test('should select all data types', () => {
        expectType<{
            int8: string | null;
            bigint: string | null;
            bigserial: string | null;
            serial8: string | null;
            bit: string | null;
            bitVarying: string | null;
            varbit: string | null;
            boolean: boolean | null;
            bool: boolean | null;
            box: string | null;
            bytea: Buffer | null;
            character: string | null;
            char: string | null;
            characterVarying: string | null;
            varchar: string | null;
            circle: { x: number; y: number; radius: number; } | null;
            cidr: string | null;
            caseInsensitiveText: string | null;
            citext: string | null;
            date: Date | null;
            doublePrecision: number | null;
            float8: number | null;
            inet: string | null;
            decimal: string | null;
            integer: number | null;
            int: number | null;
            int4: number | null;
            interval: unknown | null;
            json: unknown | null;
            jsonb: unknown | null;
            line: string | null;
            lseg: string | null;
            macaddr: string | null;
            macaddr8: string | null;
            money: string | null;
            numeric: string | null;
            point: { x: number; y: number; } | null;
            path: string | null;
            pgLsn: string | null;
            polygon: string | null;
            real: number | null;
            float4: number | null;
            smallint: number | null;
            int2: number | null;
            serial: number | null;
            serial4: number | null;
            smallserial: number | null;
            serial2: number | null;
            text: string | null;
            time: string | null;
            timeWithoutTimeZone: string | null;
            timeWithTimeZone: string | null;
            timestamp: Date | null;
            timestamptz: Date | null;
            timestampWithoutTimeZone: Date | null;
            timestampWithTimeZone: Date | null;
            tsquery: string | null;
            tsvector: string | null;
            txidSnapshot: string | null;
            uuid: string | null;
            xml: string | null;
            enumType: 'A' | 'B' | 'C' | null;
            array: string[] | null;
            array2d: string[][] | null;
        }>(toSnap(db
            .select(
                db.foo.int8,
                db.foo.bigint,
                db.foo.bigserial,
                db.foo.serial8,
                db.foo.bit,
                db.foo.bitVarying,
                db.foo.varbit,
                db.foo.boolean,
                db.foo.bool,
                db.foo.box,
                db.foo.bytea,
                db.foo.character,
                db.foo.char,
                db.foo.characterVarying,
                db.foo.varchar,
                db.foo.circle,
                db.foo.cidr,
                db.foo.caseInsensitiveText,
                db.foo.citext,
                db.foo.date,
                db.foo.doublePrecision,
                db.foo.float8,
                db.foo.inet,
                db.foo.decimal,
                db.foo.integer,
                db.foo.int,
                db.foo.int4,
                db.foo.interval,
                db.foo.json,
                db.foo.jsonb,
                db.foo.line,
                db.foo.lseg,
                db.foo.macaddr,
                db.foo.macaddr8,
                db.foo.money,
                db.foo.numeric,
                db.foo.point,
                db.foo.path,
                db.foo.pgLsn,
                db.foo.polygon,
                db.foo.real,
                db.foo.float4,
                db.foo.smallint,
                db.foo.int2,
                db.foo.serial,
                db.foo.serial4,
                db.foo.smallserial,
                db.foo.serial2,
                db.foo.text,
                db.foo.time,
                db.foo.timeWithoutTimeZone,
                db.foo.timeWithTimeZone,
                db.foo.timestamp,
                db.foo.timestamptz,
                db.foo.timestampWithoutTimeZone,
                db.foo.timestampWithTimeZone,
                db.foo.tsquery,
                db.foo.tsvector,
                db.foo.txidSnapshot,
                db.foo.uuid,
                db.foo.xml,
                db.foo.enumType,
                db.foo.array,
                db.foo.array2d,
            )
            .from(db.foo),
        ));
    });
});
