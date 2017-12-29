"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var __1 = require("..");
describe("Simulator", function () {
    var simulator;
    beforeEach(function () {
        simulator = new __1.default();
    });
    describe("CREATE TYPE", function () {
        var simulate = function (query, types, initialTypes) {
            if (initialTypes === void 0) { initialTypes = {}; }
            simulator.types = initialTypes;
            simulator.simulateQuery(query);
            expect(simulator.types).toEqual(types);
        };
        it("should create enumerated type", function () {
            var query = "CREATE TYPE test AS ENUM ('a', 'b,', 'c')";
            var types = {
                test: {
                    name: "test",
                    type: "enum",
                    labels: [
                        "a",
                        "b,",
                        "c",
                    ],
                },
            };
            simulate(query, types);
        });
        it("should create enumerated type with escape character", function () {
            var query = "CREATE TYPE test AS ENUM ('a', 'b\\'', 'c')";
            var types = {
                test: {
                    name: "test",
                    type: "enum",
                    labels: [
                        "a",
                        "b\\'",
                        "c",
                    ],
                },
            };
            simulate(query, types);
        });
        it("should drop enumerated type", function () {
            var query = "DROP TYPE test";
            var types = {
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
            simulate(query, {}, types);
        });
    });
    describe("ALTER TYPE", function () {
        var simulate = function (query, types) {
            simulator.types = {
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
            simulator.simulateQuery(query);
            expect(simulator.types).toEqual(types);
        };
        it("should add value at the back", function () {
            var query = "ALTER TYPE test ADD VALUE 'd' AFTER 'c'";
            var types = {
                test: {
                    name: "test",
                    type: "enum",
                    labels: [
                        "a",
                        "b",
                        "c",
                        "d",
                    ],
                }
            };
            simulate(query, types);
        });
        it("should add value in the front", function () {
            var query = "ALTER TYPE test ADD VALUE 'd' BEFORE 'a'";
            var types = {
                test: {
                    name: "test",
                    type: "enum",
                    labels: [
                        "d",
                        "a",
                        "b",
                        "c",
                    ]
                }
            };
            simulate(query, types);
        });
        it("should add value in the middle", function () {
            var query = "ALTER TYPE test ADD VALUE 'd' AFTER 'b'";
            var types = {
                test: {
                    name: "test",
                    type: "enum",
                    labels: [
                        "a",
                        "b",
                        "d",
                        "c",
                    ],
                }
            };
            simulate(query, types);
        });
    });
    describe("CREATE TABLE", function () {
        var simulate = function (query, tables, initialTables) {
            if (initialTables === void 0) { initialTables = {}; }
            simulator.tables = initialTables;
            simulator.simulateQuery(query);
            expect(simulator.tables).toEqual(tables);
        };
        it("should create basic table with different data types", function () {
            var query = "CREATE TABLE account (\n        id INTEGER,\n        first_name TEXT,\n        last_name MySpecialType\n      )";
            var tables = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                        first_name: {
                            dataType: "TEXT",
                            name: "first_name",
                            modifiers: {},
                        },
                        last_name: {
                            dataType: "MySpecialType",
                            name: "last_name",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            simulate(query, tables);
        });
        it("should create table with PRIMARY KEY", function () {
            var query = "CREATE TABLE account (\n        id INTEGER PRIMARY KEY\n      )";
            var tables = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [{
                            type: "primaryKey",
                            name: "account_pkey",
                            columns: [
                                "id",
                            ],
                        }]
                },
            };
            simulate(query, tables);
        });
        it("should create table with NOT NULL", function () {
            var query = "CREATE TABLE account (\n        id INTEGER NOT NULL\n      )";
            var tables = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {
                                notNull: true,
                            },
                        },
                    },
                    indexes: [],
                },
            };
            simulate(query, tables);
        });
        describe("getInScope", function () {
            var testScope = function (testString) {
                it(testString, function () {
                    simulator.input = "(" + testString + ")";
                    simulator.scope(function () {
                        var inScope = simulator.getInScope();
                        expect(inScope).toEqual(testString);
                        return undefined;
                    });
                });
            };
            testScope("value > 0");
            testScope("value + (123 / 2) < 0");
            testScope("value + \"te)st\"");
            testScope("value + \"'\"");
            testScope("value + \"`\"");
            testScope("value + \"`\"");
            testScope("value \\)");
        });
        it("should create table with CHECK", function () {
            var query = "CREATE TABLE account (\n        id INTEGER CHECK (id > 0)\n      )";
            var tables = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [{
                            type: "check",
                            name: "account_id_check",
                            expression: "id > 0",
                            columns: [
                                "id",
                            ],
                        }],
                },
            };
            simulate(query, tables);
        });
        it("should create table with DEFAULT NOW()", function () {
            var query = "CREATE TABLE account (\n        id TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()\n      )";
            var tables = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "TIMESTAMP WITHOUT TIME ZONE",
                            name: "id",
                            modifiers: {
                                default: "NOW()",
                            },
                        },
                    },
                    indexes: [],
                },
            };
            simulate(query, tables);
        });
        it("should create table with DEFAULT uuid_generate_v4() and primary key", function () {
            var query = "CREATE TABLE account (\n        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY\n      )";
            var tables = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "UUID",
                            name: "id",
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
                },
            };
            simulate(query, tables);
        });
        it("should create table with DEFAULT 1", function () {
            var query = "CREATE TABLE account (\n        id TIMESTAMP WITHOUT TIME ZONE DEFAULT 1\n      )";
            var tables = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "TIMESTAMP WITHOUT TIME ZONE",
                            name: "id",
                            modifiers: {
                                default: "1",
                            },
                        },
                    },
                    indexes: [],
                },
            };
            simulate(query, tables);
        });
        it("should create table with DEFAULT \"test\"", function () {
            var query = "CREATE TABLE account (\n        id TIMESTAMP WITHOUT TIME ZONE DEFAULT \"test\"\n      )";
            var tables = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "TIMESTAMP WITHOUT TIME ZONE",
                            name: "id",
                            modifiers: {
                                default: "\"test\"",
                            },
                        },
                    },
                    indexes: [],
                },
            };
            simulate(query, tables);
        });
        it("should create table with DEFAULT \"test\"", function () {
            var query = "CREATE TABLE account (\n        id TIMESTAMP WITHOUT TIME ZONE DEFAULT \"test\"\n      )";
            var tables = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "TIMESTAMP WITHOUT TIME ZONE",
                            name: "id",
                            modifiers: {
                                default: "\"test\"",
                            },
                        },
                    },
                    indexes: [],
                },
            };
            simulate(query, tables);
        });
        it("should create table with column with foreign key constraint", function () {
            var query = "CREATE TABLE account (\n        test_id INTEGER REFERENCES test (id)\n      )";
            var tables = {
                account: {
                    name: "account",
                    columns: {
                        test_id: {
                            dataType: "INTEGER",
                            name: "test_id",
                            modifiers: {},
                        },
                    },
                    indexes: [{
                            type: "foreignKey",
                            name: "account_test_id_fkey",
                            tableName: "test",
                            columns: [
                                "test_id",
                            ],
                            referenceColumns: [
                                "id",
                            ],
                        }],
                },
            };
            simulate(query, tables);
        });
        it("should create table with column with multiple columns and a foreign key constraint", function () {
            var query = "CREATE TABLE account_token (\n        account_id INTEGER NOT NULL REFERENCES account (id),\n        local_token TEXT NOT NULL\n      )";
            var tables = {
                account_token: {
                    name: "account_token",
                    columns: {
                        account_id: {
                            dataType: "INTEGER",
                            name: "account_id",
                            modifiers: {
                                notNull: true,
                            },
                        },
                        local_token: {
                            dataType: "TEXT",
                            name: "local_token",
                            modifiers: {
                                notNull: true,
                            },
                        },
                    },
                    indexes: [{
                            type: "foreignKey",
                            name: "account_token_account_id_fkey",
                            columns: [
                                "account_id",
                            ],
                            referenceColumns: [
                                "id",
                            ],
                            tableName: "account",
                        }],
                },
            };
            simulate(query, tables);
        });
        it("should set unique constraint", function () {
            var query = "CREATE TABLE test (\n        id INTEGER PRIMARY KEY,\n        name TEXT UNIQUE\n      )";
            var tables = {
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
                    indexes: [{
                            type: "primaryKey",
                            name: "test_pkey",
                            columns: [
                                "id",
                            ],
                        }, {
                            type: "unique",
                            name: "test_name_key",
                            columns: [
                                "name",
                            ],
                        }],
                }
            };
            simulate(query, tables);
        });
        it("should set primary key as first constraint", function () {
            var query = "CREATE TABLE test (\n        name TEXT UNIQUE,\n        id INTEGER PRIMARY KEY\n      )";
            var tables = {
                test: {
                    name: "test",
                    columns: {
                        name: {
                            name: "name",
                            dataType: "TEXT",
                            modifiers: {},
                        },
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
                        }, {
                            type: "unique",
                            name: "test_name_key",
                            columns: [
                                "name",
                            ],
                        }],
                }
            };
            simulate(query, tables);
        });
        it("create multi-column primary key", function () {
            var query = "CREATE TABLE test (\n        id INTEGER,\n        name TEXT,\n        PRIMARY KEY (id, name)\n      )";
            var tables = {
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
                    indexes: [{
                            type: "primaryKey",
                            name: "test_id_name_pkey",
                            columns: [
                                "id",
                                "name",
                            ],
                        }],
                }
            };
            simulate(query, tables);
        });
        it("create multi-column unique", function () {
            var query = "CREATE TABLE test (\n        id INTEGER,\n        name TEXT,\n        UNIQUE (id, name)\n      )";
            var tables = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            name: "id",
                            modifiers: {},
                            dataType: "INTEGER",
                        },
                        name: {
                            name: "name",
                            modifiers: {},
                            dataType: "TEXT",
                        },
                    },
                    indexes: [{
                            type: "unique",
                            name: "test_id_name_key",
                            columns: [
                                "id",
                                "name",
                            ],
                        }],
                }
            };
            simulate(query, tables);
        });
        it("create multi-column foreign key", function () {
            var query = "CREATE TABLE test (\n        foo_id INTEGER,\n        bar_id INTEGER,\n        FOREIGN KEY (foo_id, bar_id) REFERENCES foo (id, bar_id)\n      )";
            var tables = {
                test: {
                    name: "test",
                    columns: {
                        foo_id: {
                            name: "foo_id",
                            modifiers: {},
                            dataType: "INTEGER",
                        },
                        bar_id: {
                            name: "bar_id",
                            modifiers: {},
                            dataType: "INTEGER",
                        },
                    },
                    indexes: [{
                            type: "foreignKey",
                            name: "test_foo_id_bar_id_fkey",
                            columns: [
                                "foo_id",
                                "bar_id",
                            ],
                            referenceColumns: [
                                "id",
                                "bar_id",
                            ],
                            tableName: "foo",
                        }],
                },
                foo: {
                    name: "foo",
                    columns: {
                        id: {
                            name: "id",
                            modifiers: {},
                            dataType: "INTEGER",
                        },
                        bar_id: {
                            name: "bar_id",
                            modifiers: {},
                            dataType: "INTEGER",
                        },
                    },
                    indexes: [],
                },
            };
            var initialTables = {
                foo: {
                    name: "foo",
                    columns: {
                        id: {
                            name: "id",
                            modifiers: {},
                            dataType: "INTEGER",
                        },
                        bar_id: {
                            name: "bar_id",
                            modifiers: {},
                            dataType: "INTEGER",
                        },
                    },
                    indexes: [],
                },
            };
            simulate(query, tables, initialTables);
        });
        it("create references without column name", function () {
            // From the docs: "because in absence of a column list the primary key of the referenced
            // table is used as the referenced column(s)."
            var query = "CREATE TABLE test (\n        foo_id INTEGER REFERENCES foo\n      )";
            var initialTables = {
                foo: {
                    name: "foo",
                    columns: {
                        id: {
                            name: "id",
                            modifiers: {},
                            dataType: "INTEGER",
                        },
                    },
                    indexes: [{
                            type: "primaryKey",
                            name: "foo_pkey",
                            columns: [
                                "id",
                            ],
                        }],
                },
            };
            var tables = __assign({ test: {
                    name: "test",
                    columns: {
                        foo_id: {
                            name: "foo_id",
                            modifiers: {},
                            dataType: "INTEGER",
                        },
                    },
                    indexes: [{
                            type: "foreignKey",
                            name: "test_foo_id_fkey",
                            tableName: "foo",
                            columns: [
                                "foo_id",
                            ],
                            referenceColumns: [],
                        }],
                } }, initialTables);
            simulate(query, tables, initialTables);
        });
        // TODO: Also check the name of foreign key/index/etc.
    });
    describe("ALTER TABLE", function () {
        var simulate = function (tables, query, result) {
            simulator.tables = tables;
            simulator.simulateQuery(query);
            expect(simulator.tables).toEqual(result);
        };
        it("should drop table", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var query = "DROP TABLE account";
            simulate(before, query, {});
        });
        it("should drop column", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE account DROP COLUMN id";
            var after = lodash_1.cloneDeep(before);
            delete after.account.columns.id;
            simulate(before, query, after);
        });
        it("should add column with not null", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE account ADD COLUMN name TEXT NOT NULL";
            var after = lodash_1.cloneDeep(before);
            after.account.columns.name = {
                dataType: "TEXT",
                name: "name",
                modifiers: {
                    notNull: true,
                },
            };
            simulate(before, query, after);
        });
        it("should add column with default \"test\"", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE account ADD COLUMN name TEXT DEFAULT \"test\"";
            var after = lodash_1.cloneDeep(before);
            after.account.columns.name = {
                dataType: "TEXT",
                name: "name",
                modifiers: {
                    default: "\"test\"",
                },
            };
            simulate(before, query, after);
        });
        it("should alter column [set data] type", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE account ALTER COLUMN id TYPE SERIAL";
            var after = lodash_1.cloneDeep(before);
            after.account.columns.id.dataType = "SERIAL";
            simulate(before, query, after);
        });
        it("should alter column set data type", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE account ALTER COLUMN id SET DATA TYPE SERIAL";
            var after = lodash_1.cloneDeep(before);
            after.account.columns.id.dataType = "SERIAL";
            simulate(before, query, after);
        });
        it("should alter column set default 123", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE account ALTER COLUMN id SET DEFAULT 123";
            var after = lodash_1.cloneDeep(before);
            after.account.columns.id.modifiers = {
                default: "123",
            };
            simulate(before, query, after);
        });
        it("should alter column drop default", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {
                                default: "123",
                            },
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE account ALTER COLUMN id DROP DEFAULT";
            var after = lodash_1.cloneDeep(before);
            after.account.columns.id.modifiers = {};
            simulate(before, query, after);
        });
        it("should alter column set not null", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE account ALTER COLUMN id SET NOT NULL";
            var after = lodash_1.cloneDeep(before);
            after.account.columns.id.modifiers = {
                notNull: true,
            };
            simulate(before, query, after);
        });
        it("should alter column drop not null", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {
                                notNull: true,
                            },
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE account ALTER COLUMN id DROP NOT NULL";
            var after = lodash_1.cloneDeep(before);
            after.account.columns.id.modifiers = {};
            simulate(before, query, after);
        });
        it("should rename column", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE account RENAME COLUMN id TO test";
            var after = lodash_1.cloneDeep(before);
            after.account.columns.id.name = "test";
            after.account.columns.test = after.account.columns.id;
            delete after.account.columns.id;
            simulate(before, query, after);
        });
        it("should set default and not null", function () {
            var before = {
                account: {
                    name: "account",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE account ALTER COLUMN id SET NOT NULL, ALTER COLUMN id SET DEFAULT 123";
            var after = lodash_1.cloneDeep(before);
            after.account.columns.id.modifiers = {
                notNull: true,
                default: "123",
            };
            simulate(before, query, after);
        });
        it("should alter table add column", function () {
            var before = {
                test: {
                    name: "test",
                    columns: {
                        id: {
                            dataType: "INTEGER",
                            name: "id",
                            modifiers: {},
                        },
                    },
                    indexes: [],
                },
            };
            var query = "ALTER TABLE test ADD COLUMN value TEXT";
            var after = lodash_1.cloneDeep(before);
            after.test.columns.value = {
                dataType: "TEXT",
                name: "value",
                modifiers: {},
            };
            simulate(before, query, after);
        });
    });
});
//# sourceMappingURL=simulator.test.js.map