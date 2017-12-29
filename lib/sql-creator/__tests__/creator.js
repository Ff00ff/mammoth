"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var __1 = require("..");
var sql_simulator_1 = require("../../sql-simulator");
describe("creator", function () {
    describe("type", function () {
        var create = function (from, to) {
            var fromSimulator = new sql_simulator_1.default();
            fromSimulator.types = from;
            var toSimulator = new sql_simulator_1.default();
            toSimulator.types = to;
            return __1.createSql(fromSimulator, toSimulator);
        };
        it("should create type", function () {
            var from = {};
            var to = {
                test: {
                    name: "test",
                    type: "enum",
                    labels: [
                        "a",
                        "b",
                        "c",
                    ],
                },
            };
            var queries = create(from, to);
            expect(queries).toEqual([
                "CREATE TYPE test AS ENUM ('a', 'b', 'c')",
            ]);
        });
        it("should drop type", function () {
            var from = {
                test: {
                    name: "test",
                    type: "enum",
                    labels: [
                        "a",
                        "b",
                        "c",
                    ],
                },
            };
            var to = {};
            var queries = create(from, to);
            expect(queries).toEqual([
                "DROP TYPE test",
            ]);
        });
        it("should add value in the back", function () {
            var from = {
                test: {
                    name: "test",
                    type: "enum",
                    labels: [
                        "a",
                        "b",
                        "c",
                    ],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.labels.push("d");
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TYPE test ADD VALUE 'd' AFTER 'c'",
            ]);
        });
        it("should add value at the front", function () {
            var from = {
                test: {
                    name: "test",
                    type: "enum",
                    labels: [
                        "a",
                        "b",
                        "c",
                    ],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.labels.splice(0, 0, "d");
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TYPE test ADD VALUE 'd' BEFORE 'a'",
            ]);
        });
        it("should add value in the middle", function () {
            var from = {
                test: {
                    name: "test",
                    type: "enum",
                    labels: [
                        "a",
                        "b",
                        "c",
                    ],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.labels.splice(2, 0, "d");
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TYPE test ADD VALUE 'd' AFTER 'b'",
            ]);
        });
        it("should add multiple values", function () {
            var from = {
                test: {
                    name: "test",
                    type: "enum",
                    labels: [
                        "a",
                        "b",
                        "c",
                    ],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.labels.splice(0, 0, "d");
            to.test.labels.splice(2, 0, "e");
            to.test.labels.splice(5, 0, "f");
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TYPE test ADD VALUE 'd' BEFORE 'a'",
                "ALTER TYPE test ADD VALUE 'e' AFTER 'a'",
                "ALTER TYPE test ADD VALUE 'f' AFTER 'c'",
            ]);
        });
        it("cannot drop value", function () {
            // TODO: You cannot drop a value. You must drop the type and re-create the type without the value. Is this something we want to do automatically?
        });
    });
    describe("table", function () {
        var create = function (from, to) {
            var fromSimulator = new sql_simulator_1.default();
            fromSimulator.tables = from;
            var toSimulator = new sql_simulator_1.default();
            toSimulator.tables = to;
            return __1.createSql(fromSimulator, toSimulator);
        };
        it("should add column", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.columns.value = {
                name: "value",
                dataType: "TEXT",
                modifiers: {},
            };
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ADD COLUMN value TEXT",
            ]);
        });
        it("should drop column", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                        value: {
                            name: "value",
                            dataType: "TEXT",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            delete to.test.columns.value;
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test DROP COLUMN value",
            ]);
        });
        it("should rename column", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                        value: {
                            name: "value",
                            dataType: "TEXT",
                            modifiers: {
                                notNull: true,
                            }
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.columns.test = to.test.columns.value;
            to.test.columns.test.name = "test";
            delete to.test.columns.value;
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test RENAME COLUMN value TO test",
            ]);
        });
        it("should add table", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.account = {
                name: "account",
                columns: {
                    id: {
                        name: "id",
                        dataType: "UUID",
                        modifiers: {
                            default: "uuid_generate_v4()",
                        },
                    },
                },
                indexes: [{
                        type: "primaryKey",
                        name: "account_pkey",
                        columns: [
                            "id",
                        ],
                    }],
            };
            var queries = create(from, to);
            expect(queries).toEqual([
                "CREATE TABLE account (\n\tid UUID DEFAULT uuid_generate_v4() PRIMARY KEY\n)",
            ]);
        });
        it("should drop table", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = {};
            var queries = create(from, to);
            expect(queries).toEqual([
                "DROP TABLE test",
            ]);
        });
        it("should rename table", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.name = "test2";
            to.test2 = to.test;
            delete to.test;
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test RENAME TO test2",
            ]);
        });
        it("should set default", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.columns.id.modifiers.default = "1";
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ALTER COLUMN id SET DEFAULT 1",
            ]);
        });
        it("should drop default", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {
                                default: "1",
                            },
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            delete to.test.columns.id.modifiers.default;
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ALTER COLUMN id DROP DEFAULT",
            ]);
        });
        it("should set not null", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.columns.id.modifiers.notNull = true;
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ALTER COLUMN id SET NOT NULL",
            ]);
        });
        it("should drop not null", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {
                                notNull: true,
                            },
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            delete to.test.columns.id.modifiers.notNull;
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ALTER COLUMN id DROP NOT NULL",
            ]);
        });
        it("should change data type", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.columns.id.dataType = "TEXT";
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ALTER COLUMN id SET DATA TYPE TEXT",
            ]);
        });
        it("should add check constraint", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [{
                    type: "check",
                    name: "test_id_check",
                    columns: [],
                    expression: "id > 0",
                }];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ADD CONSTRAINT test_id_check CHECK (id > 0)",
            ]);
        });
        it("should drop check from column", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [{
                            type: "check",
                            name: "test_id_check",
                            columns: [
                                "id",
                            ],
                            expression: "id > 0",
                        }],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test DROP CONSTRAINT test_id_check",
            ]);
        });
        it("should drop check from table indexes", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [{
                            type: "check",
                            name: "some_constraint_checker",
                            expression: "id > 0",
                            columns: [],
                        }],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test DROP CONSTRAINT some_constraint_checker",
            ]);
        });
        it("should alter check", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [{
                            type: "check",
                            name: "some_constraint_checker",
                            expression: "id > 0",
                            columns: [],
                        }],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes[0].expression = "id > 1";
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test DROP CONSTRAINT some_constraint_checker",
                "ALTER TABLE test ADD CONSTRAINT some_constraint_checker CHECK (id > 1)",
            ]);
        });
        it("should add references", function () {
            var from = {
                foo: {
                    name: "foo",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
                test: {
                    name: "test",
                    columns: {
                        foo_id: {
                            name: "foo_id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [{
                    type: "foreignKey",
                    name: "test_foo_id_fkey",
                    columns: [
                        "foo_id",
                    ],
                    tableName: "foo",
                    referenceColumns: [
                        "id",
                    ],
                }];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ADD CONSTRAINT test_foo_id_fkey FOREIGN KEY (foo_id) REFERENCES foo (id)",
            ]);
        });
        it("should add references without reference column", function () {
            var from = {
                foo: {
                    name: "foo",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
                test: {
                    name: "test",
                    columns: {
                        foo_id: {
                            name: "foo_id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [{
                    type: "foreignKey",
                    name: "test_foo_id_fkey",
                    columns: [
                        "foo_id",
                    ],
                    tableName: "foo",
                    referenceColumns: [],
                }];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ADD CONSTRAINT test_foo_id_fkey FOREIGN KEY (foo_id) REFERENCES foo",
            ]);
        });
        it("should drop references", function () {
            var from = {
                foo: {
                    name: "foo",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
                test: {
                    name: "test",
                    columns: {
                        foo_id: {
                            name: "foo_id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [{
                            type: "foreignKey",
                            name: "test_foo_id_fkey",
                            columns: [
                                "foo_id",
                            ],
                            tableName: "foo",
                            referenceColumns: [
                                "id",
                            ],
                        }],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test DROP CONSTRAINT test_foo_id_fkey",
            ]);
        });
        it("should add unique", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [{
                    type: "unique",
                    name: "test_id_key",
                    columns: [
                        "id",
                    ],
                }];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ADD CONSTRAINT test_id_key UNIQUE (id)",
            ]);
        });
        it("should add multi-column unique", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                        name: {
                            name: "name",
                            dataType: "TEXT",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [{
                    type: "unique",
                    name: "test_id_name_key",
                    columns: [
                        "id",
                        "name",
                    ],
                }];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ADD CONSTRAINT test_id_name_key UNIQUE (id, name)",
            ]);
        });
        it("should drop unique", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [{
                            type: "unique",
                            name: "test_id_key",
                            columns: [
                                "id",
                            ],
                        }],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test DROP CONSTRAINT test_id_key",
            ]);
        });
        it("should add primary key", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [{
                    type: "primaryKey",
                    name: "test_pkey",
                    columns: [
                        "id",
                    ],
                }];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ADD CONSTRAINT test_pkey PRIMARY KEY (id)",
            ]);
        });
        it("should add multi-column primary key", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                        name: {
                            name: "name",
                            dataType: "TEXT",
                            modifiers: {},
                        }
                    },
                    indexes: [],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [{
                    type: "primaryKey",
                    name: "test_pkey",
                    columns: [
                        "id",
                        "name",
                    ],
                }];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test ADD CONSTRAINT test_pkey PRIMARY KEY (id, name)",
            ]);
        });
        it("should drop primary key", function () {
            var from = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            dataType: "INTEGER",
                            modifiers: {},
                        },
                    },
                    indexes: [{
                            type: "primaryKey",
                            name: "test_pkey",
                            columns: [
                                "id",
                            ],
                        }],
                },
            };
            var to = lodash_1.cloneDeep(from);
            to.test.indexes = [];
            var queries = create(from, to);
            expect(queries).toEqual([
                "ALTER TABLE test DROP CONSTRAINT test_pkey",
            ]);
        });
    });
});
//# sourceMappingURL=creator.js.map