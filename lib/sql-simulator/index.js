"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var lodash_1 = require("lodash");
var Simulator = /** @class */ (function () {
    function Simulator(simulator) {
        this.tables = {};
        this.types = {};
        if (simulator) {
            this.tables = lodash_1.cloneDeep(simulator.tables);
            this.types = lodash_1.cloneDeep(simulator.types);
        }
    }
    Simulator.prototype.toJSON = function () {
        return {
            tables: this.tables,
            types: this.types,
        };
    };
    Simulator.prototype.findByRegExp = function (regexp) {
        if (this.input) {
            var result = regexp.exec(this.input);
            if (result) {
                var found = result[1];
                this.input = this.input.slice(found.length).replace(/^\s*/g, "");
                return found;
            }
        }
        return undefined;
    };
    Simulator.prototype.getToken = function (expectedTokens) {
        var result = this.findToken(expectedTokens);
        if (!result) {
            throw new Error("Could not find one of token " + expectedTokens.join(", ") + ".");
        }
        return result;
    };
    Simulator.prototype.findToken = function (expectedTokens) {
        var regexp = new RegExp("^(" + expectedTokens.map(function (token) { return lodash_1.escapeRegExp(token); }).join("|") + ")(\\b|\\s|$|,|')", "i");
        return this.findByRegExp(regexp);
    };
    Simulator.prototype.optionalToken = function (expectedTokens) {
        var token = this.findToken(expectedTokens);
        return Boolean(token);
    };
    Simulator.prototype.ifToken = function (expectedTokens, ifCallback, elseCallback) {
        var token = this.findToken(expectedTokens);
        if (token) {
            ifCallback(token);
            return true;
        }
        else if (elseCallback) {
            elseCallback();
        }
        return false;
    };
    Simulator.prototype.getUntil = function (excludeTokens) {
        var regexp = new RegExp("^(.*?)\\s*(:?!" + excludeTokens.map(function (token) { return lodash_1.escapeRegExp(token); }).join("|") + "|$)", "i");
        var result = this.findByRegExp(regexp);
        if (!result) {
            throw new Error("Could not find one of " + excludeTokens + ". Current input is " + this.input);
        }
        return result;
    };
    Simulator.prototype.getIdentifier = function () {
        var regexp = new RegExp("^([\\w\\._\"]+)", "i");
        var result = this.findByRegExp(regexp);
        if (!result) {
            console.log(this.input);
            throw new Error("Unknown identifier.");
        }
        return result;
    };
    Simulator.prototype.getString = function () {
        var input = this.input;
        if (!input) {
            throw new Error("No input set.");
        }
        assert(input[0] === "'", "Does not start with string opening '.");
        var _loop_1 = function (i) {
            var isEscaped = function () {
                var search = i - 1;
                var escaped = false;
                while (search >= 0) {
                    var character_1 = input[search];
                    if (character_1 === "\\") {
                        escaped = !escaped;
                    }
                    else {
                        break;
                    }
                    search--;
                }
                return escaped;
            };
            var character = input[i];
            if (character === "'" && !isEscaped()) {
                var found = input.slice(1, i);
                this_1.input = input.slice(found.length + 2).replace(/^\s*/g, "");
                return { value: found };
            }
        };
        var this_1 = this;
        for (var i = 1; i < input.length; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        throw new Error("Could not find end of string character '.");
    };
    Simulator.prototype.getInScope = function () {
        // We want to loop the input and keep track of strings etc.
        var input = this.input;
        if (!input) {
            throw new Error("No input set.");
        }
        var state = {
            string: null,
            '{': 0,
            '(': 0,
            '[': 0,
        };
        var closingBraces = {
            '}': "{",
            ')': "(",
            ']': "[",
        };
        var openingBraces = {
            '{': '}',
            '(': ')',
            '[': ']',
        };
        var _loop_2 = function (i) {
            var isEscaped = function () {
                var search = i - 1;
                var escaped = false;
                while (search >= 0) {
                    var character_2 = input[search];
                    if (character_2 === "\\") {
                        escaped = !escaped;
                    }
                    else {
                        break;
                    }
                    search--;
                }
                return escaped;
            };
            var character = input[i];
            if (state.string !== null) {
                if (character === state.string && !isEscaped()) {
                    state.string = null;
                }
            }
            else if (character === ")" && state["{"] === 0 && state["["] === 0 && state["("] === 0 && !isEscaped()) {
                var found = input.slice(0, i);
                this_2.input = input.slice(found.length).replace(/^\s*/g, "");
                return { value: found };
            }
            else if (character === "\"" || character === "'" || character === "`") {
                state.string = character;
            }
            else if ((character === '}' || character === ')' || character === ']') && closingBraces[character] && !isEscaped()) {
                state[closingBraces[character]] -= 1;
                if (state[closingBraces[character]] < 0) {
                    throw new Error("A " + character + " too many. There was no matching " + closingBraces[character] + ".");
                }
            }
            else if ((character === '{' || character === '(' || character === '[') && openingBraces[character] && !isEscaped()) {
                state[character] += 1;
            }
        };
        var this_2 = this;
        for (var i = 0; i < input.length; i++) {
            var state_2 = _loop_2(i);
            if (typeof state_2 === "object")
                return state_2.value;
        }
        throw new Error("Could not find closing ).");
    };
    Simulator.prototype.getExpression = function () {
        var regexp = new RegExp("^([\\w\\._\"\\(\\)]+)", "i");
        var result = this.findByRegExp(regexp);
        if (!result) {
            throw new Error("Unknown identifier.");
        }
        return result;
    };
    Simulator.prototype.scope = function (callback) {
        var openBracket = this.findToken(["("]);
        if (openBracket) {
            var result = callback();
            this.getToken([")"]);
            return result;
        }
        return undefined;
    };
    Simulator.prototype.repeat = function (callback) {
        while (true) {
            var result = callback();
            if (!result) {
                break;
            }
        }
    };
    Simulator.prototype.switchToken = function (map) {
        var expectedTokens = Object.keys(map);
        return this.ifToken(expectedTokens, function (token) {
            var callback = map[token];
            callback();
        });
    };
    Simulator.prototype.simulateDropType = function () {
        this.optionalToken(["IF EXISTS"]);
        var typeName = this.getIdentifier();
        this.ifToken(["CASCADE", "RESTRICT"], function () {
            //
        });
        if (this.types[typeName]) {
            delete this.types[typeName];
        }
    };
    Simulator.prototype.simulateDropTable = function () {
        this.optionalToken(["IF EXISTS"]);
        var tableName = this.getIdentifier();
        this.ifToken(["CASCADE", "RESTRICT"], function () {
            //
        });
        if (this.tables[tableName]) {
            delete this.tables[tableName];
        }
    };
    Simulator.prototype.simulateAlterType = function () {
        var _this = this;
        var typeName = this.getIdentifier();
        var type = this.types[typeName];
        if (!type) {
            throw new Error("Could not find type " + typeName + ".");
        }
        this.getToken(["ADD"]);
        this.getToken(["VALUE"]);
        var newValue = this.getString();
        this.ifToken(["BEFORE", "AFTER"], function (token) {
            var existingValue = _this.getString();
            var index = type.labels.findIndex(function (label) { return label === existingValue; });
            if (token.toUpperCase() === "BEFORE") {
                type.labels.splice(index, 0, newValue);
            }
            else {
                type.labels.splice(index + 1, 0, newValue);
            }
        });
    };
    Simulator.prototype.simulateAlterTable = function () {
        var _this = this;
        this.ifToken(["ALL IN TABLESPACE"], function () {
            // tableName
            _this.getIdentifier();
            _this.ifToken(["OWNED BY"], function () {
                // TODO: Is there a repeat here?
                // roleName
                _this.getIdentifier();
            });
            _this.getToken(["SET TABLESPACE"]);
            // newTablespace
            _this.getIdentifier();
            _this.ifToken(["NOWAIT"], function () {
                //
            });
            // TODO: we should set the new table space...
        });
        this.ifToken(["IF EXISTS"], function () {
            //
        });
        this.ifToken(["ONLY"], function () {
            //
        });
        var tableName = this.getIdentifier();
        var table = this.tables[tableName];
        if (!table) {
            throw new Error("Table " + tableName + " does not exist.");
        }
        var found = this.switchToken((_a = {
                RENAME: function () {
                    _this.ifToken(["CONSTRAINT"], function () {
                        // constraintName
                        _this.getIdentifier();
                        _this.getToken(["TO"]);
                        // newConstraintName
                        _this.getIdentifier();
                        // TODO: rename constraint.
                    }, function () {
                        _this.ifToken(["TO"], function () {
                            var newTableName = _this.getIdentifier();
                            table.name = newTableName;
                            _this.tables[newTableName] = table;
                            delete _this.tables[tableName];
                        }, function () {
                            _this.optionalToken(["COLUMN"]);
                            var columnName = _this.getIdentifier();
                            _this.getToken(["TO"]);
                            var newColumnName = _this.getIdentifier();
                            var table = _this.tables[tableName];
                            if (!table) {
                                throw new Error("Could not find table " + tableName + ".");
                            }
                            var column = table.columns[columnName];
                            if (!column) {
                                throw new Error("Could not find column " + columnName + " on table " + tableName + ".");
                            }
                            column.name = newColumnName;
                            table.columns[newColumnName] = column;
                            delete table.columns[columnName];
                        });
                    });
                }
            },
            _a["SET SCHEMA"] = function () {
                _this.getIdentifier();
                // TODO: Set the schema name. This also means we need to parse the schema from the table name?
            },
            _a));
        if (!found) {
            this.repeat(function () {
                _this.switchToken({
                    'DROP CONSTRAINT': function () {
                        var constraintName = _this.getIdentifier();
                        // TODO: why do we only search for tyoe check here?
                        var i = table.indexes.findIndex(function (index) { return index.type === "check" && index.name === constraintName; });
                        table.indexes.splice(i, 1);
                    },
                    ADD: function () {
                        _this.optionalToken(["COLUMN"]);
                        _this.ifToken(["IF NOT EXISTS"], function () {
                            //
                        });
                        var _a = _this.getColumn(table), column = _a.column, indexes = _a.indexes;
                        if (column) {
                            table.columns[column.name] = column;
                        }
                        indexes.forEach(function (index) { return _this.addIndex(table, index); });
                    },
                    DROP: function () {
                        _this.optionalToken(["COLUMN"]);
                        _this.ifToken(["IF NOT EXISTS"], function () {
                            //
                        });
                        var columnName = _this.getIdentifier();
                        _this.ifToken(["RESTRICT", "CASCADE"], function () {
                            //
                        });
                        delete table.columns[columnName];
                    },
                    ALTER: function () {
                        _this.optionalToken(["COLUMN"]);
                        var columnName = _this.getIdentifier();
                        var column = table.columns[columnName];
                        if (!column) {
                            throw new Error("Unknown column " + columnName + " on table " + tableName + ".");
                        }
                        _this.switchToken({
                            'SET DATA TYPE': function () {
                                var dataType = _this.getIdentifier();
                                column.dataType = dataType;
                            },
                            'TYPE': function () {
                                var dataType = _this.getIdentifier();
                                column.dataType = dataType;
                            },
                            'SET DEFAULT': function () {
                                var expression = _this.getExpression();
                                column.modifiers.default = expression;
                            },
                            'DROP DEFAULT': function () {
                                delete column.modifiers.default;
                            },
                            'SET NOT NULL': function () {
                                column.modifiers.notNull = true;
                            },
                            'DROP NOT NULL': function () {
                                delete column.modifiers.notNull;
                            },
                        });
                    },
                });
                return _this.findToken([","]);
            });
        }
        var _a;
    };
    Simulator.prototype.addIndex = function (table, index) {
        if (index.type === "primaryKey") {
            table.indexes.splice(0, 0, index);
        }
        else {
            table.indexes.push(index);
        }
    };
    Simulator.prototype.getColumn = function (table) {
        var _this = this;
        var indexes = [];
        var column;
        var constraintName;
        this.ifToken(["CONSTRAINT"], function () {
            constraintName = _this.getIdentifier();
        });
        this.ifToken(["PRIMARY KEY", "FOREIGN KEY", "UNIQUE", "CHECK"], function (token) {
            var type = (function (token) {
                if (token === "primary key") {
                    return "primaryKey";
                }
                else if (token === "foreign key") {
                    return "foreignKey";
                }
                else if (token === "check") {
                    return "check";
                }
                return "unique";
            })(token.toLowerCase());
            var index = {
                type: type,
                columns: [],
            };
            _this.scope(function () {
                if (type === "check") {
                    index.expression = _this.getInScope();
                }
                else {
                    _this.repeat(function () {
                        var columnName = _this.getIdentifier();
                        index.columns.push(columnName);
                        return _this.findToken([","]);
                    });
                }
                return undefined;
            });
            if (type === "foreignKey") {
                index.name = constraintName || table.name + "_" + index.columns.join("_") + "_fkey";
                _this.getToken(["REFERENCES"]);
                var tableName = _this.getIdentifier();
                var referenceColumns_1 = [];
                _this.scope(function () {
                    _this.repeat(function () {
                        var columnName = _this.getIdentifier();
                        referenceColumns_1.push(columnName);
                        return _this.findToken([","]);
                    });
                    return undefined;
                });
                index.tableName = tableName;
                index.referenceColumns = referenceColumns_1;
            }
            else if (type === "primaryKey") {
                index.name = constraintName || table.name + "_" + index.columns.join("_") + "_pkey";
            }
            else if (type === "unique") {
                index.name = constraintName || table.name + "_" + index.columns.join("_") + "_key";
            }
            else if (type === "check") {
                // FIXME: the CHECK is actually named based on the expression. If it references one
                // column it's added to the name. We can't just check if one of the columns is in
                // the expression, because it checks if it's really a reference.
                //
                // Some examples:
                //  "test_check" CHECK (1 > 0) -- no column
                //  "test_check1" CHECK (123 > 0) -- no column, second check
                //  "test_check2" CHECK (foo_id > val) -- multiple columns, third check
                //  "test_val_check" CHECK (length('foo_id'::text) > val) -- column as string and real reference
                //  "test_val_check1" CHECK (1 > val AND val < 0) -- one column multiple references
                if (constraintName) {
                    index.name = constraintName;
                }
                else {
                    var findIndexName_1 = function (indexName, count) {
                        if (count === void 0) { count = 0; }
                        var postfix = count === 0
                            ? ""
                            : String(count);
                        var name = indexName + postfix;
                        var exists = table.indexes.find(function (index) { return index.name === name; });
                        if (exists) {
                            return findIndexName_1(indexName, count + 1);
                        }
                        return name;
                    };
                    index.name = findIndexName_1(table.name + "_check");
                }
            }
            indexes.push(index);
        }, function () {
            column = {
                // TODO: The name may include the schema e.g. my.table (where "my" is the schema name)?
                name: _this.getIdentifier(),
                dataType: _this.getUntil(["COLLATE", "CONSTRAINT", "NULL", "NOT NULL", "CHECK", "DEFAULT", "UNIQUE", "PRIMARY KEY", "REFERENCES", ",", ")"]),
                modifiers: {},
            };
            _this.ifToken(["COLLATE"], function () {
                column.collation = _this.getIdentifier();
            });
            _this.repeat(function () {
                var constraintName;
                // TODO: Can you name a constraint like this?
                _this.ifToken(["CONSTRAINT"], function () {
                    constraintName = _this.getIdentifier();
                });
                var found = _this.switchToken((_a = {},
                    _a["NOT NULL"] = function () {
                        column.modifiers.notNull = true;
                    },
                    _a.NULL = function () {
                        column.modifiers.null = true;
                    },
                    _a.CHECK = function () {
                        var expression = _this.scope(function () { return _this.getInScope(); });
                        var index = {
                            type: "check",
                            name: constraintName || table.name + "_" + column.name + "_check",
                            columns: [
                                column.name,
                            ],
                            expression: expression,
                        };
                        _this.ifToken(["NO INHERIT"], function () {
                            // TODO: set no inherit.
                        });
                        indexes.push(index);
                    },
                    _a.DEFAULT = function () {
                        column.modifiers.default = _this.getExpression();
                    },
                    _a.UNIQUE = function () {
                        var index = {
                            type: "unique",
                            name: table.name + "_" + column.name + "_key",
                            columns: [
                                column.name,
                            ],
                        };
                        _this.ifToken(["WITH"], function () {
                            _this.scope(function () {
                                index.parameters = [];
                                _this.repeat(function () {
                                    var storageParameter = _this.getIdentifier();
                                    if (!_this.ifToken(["="], function () {
                                        var storageValue = _this.getIdentifier();
                                        index.parameters.push({
                                            key: storageParameter,
                                            value: storageValue,
                                        });
                                    })) {
                                        index.parameters.push({
                                            key: storageParameter,
                                        });
                                    }
                                    return _this.findToken([","]);
                                });
                                return undefined;
                            });
                        });
                        _this.ifToken(["USING INDEX TABLESPACE"], function () {
                            // TODO: Set index tablespace name. index.tablespaceName = this.getIdentifier();
                        });
                        indexes.push(index);
                    },
                    _a["PRIMARY KEY"] = function () {
                        var index = {
                            type: "primaryKey",
                            name: table.name + "_pkey",
                            columns: [
                                column.name,
                            ],
                        };
                        _this.ifToken(["WITH"], function () {
                            _this.scope(function () {
                                index.parameters = [];
                                _this.repeat(function () {
                                    var storageParameter = _this.getIdentifier();
                                    if (!_this.ifToken(["="], function () {
                                        var storageValue = _this.getIdentifier();
                                        index.parameters.push({
                                            key: storageParameter,
                                            value: storageValue,
                                        });
                                    })) {
                                        index.parameters.push({
                                            key: storageParameter,
                                        });
                                    }
                                    return _this.findToken([","]);
                                });
                                return undefined;
                            });
                        });
                        _this.ifToken(["USING INDEX TABLESPACE"], function () {
                            // TODO: Set index.tablespaceName = this.getIdentifier();.
                        });
                        indexes.push(index);
                    },
                    _a.REFERENCES = function () {
                        var index = {
                            type: "foreignKey",
                            name: table.name + "_" + column.name + "_fkey",
                            tableName: _this.getIdentifier(),
                            columns: [
                                column.name,
                            ],
                            referenceColumns: [],
                        };
                        _this.scope(function () {
                            _this.repeat(function () {
                                index.referenceColumns.push(_this.getIdentifier());
                                return _this.findToken([","]);
                            });
                            return undefined;
                        });
                        _this.ifToken(["MATCH"], function () {
                            // TODO: Set index.matchType = this.getToken([`FULL`, `PARTIAL`, `SIMPLE`]);.
                        });
                        _this.ifToken(["ON DELETE"], function () {
                            _this.getToken(["NO ACTION", "RESTRICT", "CASCADE", "SET NULL", "SET DEFAULT"]);
                            // TODO: Set index.onDelete = actionType;.
                        });
                        _this.ifToken(["ON UPDATE"], function () {
                            _this.getToken(["NO ACTION", "RESTRICT", "CASCADE", "SET NULL", "SET DEFAULT"]);
                            // TODO: Set index.onUpdate = actionType;.
                        });
                        indexes.push(index);
                    },
                    _a));
                if (found) {
                    // TODO: Where to apply this to?
                    _this.ifToken(["DEFERRABLE", "NOT DEFERRABLE"], function () {
                        // constraint.defferable = defferable;
                    });
                    _this.ifToken(["INITIALLY DEFERRED", "INITIALLY IMMEDIATE"], function () {
                        // constraint.initially = initially;
                    });
                }
                return found;
                var _a;
            });
        });
        return {
            column: column,
            indexes: indexes,
        };
    };
    Simulator.prototype.simulateCreateType = function () {
        var _this = this;
        var type = {
            type: "enum",
            name: this.getIdentifier(),
            labels: [],
        };
        this.getToken(["AS"]);
        this.getToken(["ENUM"]);
        this.scope(function () {
            _this.repeat(function () {
                var label = _this.getString();
                type.labels.push(label);
                return _this.findToken([","]);
            });
            return undefined;
        });
        // FIXME: type names and table names may not collide. Because we store them separately, we
        // have no checks for this. Perhaps we should store the tables and types together in a
        // relations map instead?
        this.types[type.name] = type;
    };
    Simulator.prototype.simulateCreateTable = function () {
        var _this = this;
        this.ifToken(["IF NOT EXISTS"], function () {
            // TODO: set if not exists.
        });
        var table = {
            name: this.getIdentifier(),
            columns: {},
            indexes: [],
        };
        this.scope(function () {
            _this.repeat(function () {
                var _a = _this.getColumn(table), column = _a.column, indexes = _a.indexes;
                if (column) {
                    table.columns[column.name] = column;
                }
                indexes.forEach(function (index) { return _this.addIndex(table, index); });
                return _this.findToken([","]);
            });
            return undefined;
        });
        // TODO: Parse WITH, ON COMMIT, TABLESPACE
        // TODO: Parse table constraints.
        this.tables[table.name] = table;
    };
    Simulator.prototype.simulateQuery = function (sql) {
        var _this = this;
        this.input = sql.replace(/^\s+/, "");
        var token = this.getToken(["CREATE", "ALTER", "DROP", "SELECT", "WITH", "UPDATE", "DELETE"]).toUpperCase();
        if (token === "SELECT" || token === "WITH" || token === "UPDATE" || token === "DELETE") {
            // These queries do not alter the data structure, so we can ignore them.
            this.input = undefined;
        }
        else if (token === "CREATE") {
            this.ifToken(["GLOBAL", "LOCAL", "TEMPORARY", "TEMP", "UNLOGGED"], function () {
                // TODO: It's GLOBAL or LOCAL, TEMPORARY or TEMP, or UNLOGGED. Pass this to the table.
            });
            this.switchToken({
                TABLE: function () {
                    _this.simulateCreateTable();
                },
                TYPE: function () {
                    _this.simulateCreateType();
                },
            });
        }
        else if (token === "ALTER") {
            this.switchToken({
                TABLE: function () {
                    _this.simulateAlterTable();
                },
                TYPE: function () {
                    _this.simulateAlterType();
                },
            });
        }
        else if (token === "DROP") {
            this.switchToken({
                TYPE: function () {
                    _this.simulateDropType();
                },
                TABLE: function () {
                    _this.simulateDropTable();
                },
            });
        }
    };
    return Simulator;
}());
exports.default = Simulator;
//# sourceMappingURL=index.js.map