"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var getTables = function (tables) { return Object.keys(tables).map(function (tableName) { return tables[tableName]; }); };
var getTypes = function (types) { return Object.keys(types).map(function (typeName) { return types[typeName]; }); };
var getColumns = function (table) { return Object.keys(table.columns).map(function (columnName) { return table.columns[columnName]; }); };
var getModifiersSql = function (column) {
    var modifiers = [];
    if (column.modifiers.default) {
        modifiers.push("DEFAULT " + column.modifiers.default);
    }
    if (column.modifiers.notNull) {
        modifiers.push("NOT NULL");
    }
    return modifiers.join(" ");
};
var getColumnSql = function (table, column) {
    var query = column.name + " " + column.dataType;
    if (Object.keys(column.modifiers).length > 0) {
        query += " " + getModifiersSql(column);
    }
    // Find applicable indexes.
    table.indexes.forEach(function (index) {
        if (index.columns.length === 1 && index.columns[0] === column.name) {
            if (index.type === "primaryKey") {
                query += " PRIMARY KEY";
            }
            else if (index.type === "foreignKey") {
                query += " REFERENCES " + index.tableName + " (" + index.referenceColumns.join(", ") + ")";
            }
            else if (index.type === "unique") {
                query += " UNIQUE";
            }
            else if (index.type === "check") {
                query += " CHECK (" + index.expression + ")";
            }
        }
    });
    return query;
};
var isEqualColumn = function (fromColumn, toColumn) {
    if (!fromColumn || !toColumn || fromColumn.dataType !== toColumn.dataType) {
        return false;
    }
    var fromModifiers = fromColumn.modifiers;
    var toModifiers = toColumn.modifiers;
    return Boolean((!fromModifiers.notNull && !toModifiers.notNull ||
        fromModifiers.notNull && toModifiers.notNull) &&
        (!fromModifiers.default && !toModifiers.default ||
            fromModifiers.default === toModifiers.default));
};
var isEqualTable = function (fromTable, toTable) { return Object.keys(fromTable.columns).length === Object.keys(toTable.columns).length &&
    getColumns(fromTable).every(function (fromColumn) { return isEqualColumn(fromColumn, toTable.columns[fromColumn.name]); }); };
exports.createSql = function (from, to, shouldGenerateNames) {
    if (shouldGenerateNames === void 0) { shouldGenerateNames = false; }
    var tab = '  ';
    var names = [];
    var queries = [];
    getTables(to.tables).forEach(function (toTable) {
        var fromTable = from.tables[toTable.name];
        if (!fromTable) {
            var tables = getTables(from.tables).filter(function (fromTable) { return isEqualTable(fromTable, toTable); });
            if (tables.length === 1) {
                var table = tables[0];
                var query = "ALTER TABLE " + table.name + " RENAME TO " + toTable.name;
                from.simulateQuery(query);
                queries.push(query);
                if (shouldGenerateNames) {
                    names.push("rename-" + table.name + "-to-" + toTable.name);
                }
            }
            else {
                var query = "CREATE TABLE " + toTable.name + " (\n" + Object.keys(toTable.columns).map(function (columnName) { return toTable.columns[columnName]; }).map(function (column) { return "" + tab + getColumnSql(toTable, column); }).join(",\n") + "\n)";
                from.simulateQuery(query);
                queries.push(query);
                if (shouldGenerateNames) {
                    names.push("create-" + toTable.name);
                }
            }
        }
        else {
            getColumns(toTable).forEach(function (toColumn) {
                var fromColumn = fromTable.columns[toColumn.name];
                if (!fromColumn) {
                    var columns = getColumns(fromTable).filter(function (fromColumn) { return isEqualColumn(fromColumn, toColumn); });
                    var column = columns[0];
                    if (columns.length === 1 && !toTable.columns[column.name]) {
                        var query = "ALTER TABLE " + toTable.name + " RENAME COLUMN " + column.name + " TO " + toColumn.name;
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("rename-" + column.name + "-" + toColumn.name + "-in-" + toTable.name);
                        }
                    }
                    else {
                        var query = "ALTER TABLE " + toTable.name + " ADD COLUMN " + getColumnSql(toTable, toColumn);
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("add-" + toColumn.name + "-to-" + toTable.name);
                        }
                    }
                }
                else {
                    // TODO: Create one alter table query if there are multiple changes.
                    if (fromColumn.dataType !== toColumn.dataType) {
                        var query = "ALTER TABLE " + toTable.name + " ALTER COLUMN " + toColumn.name + " SET DATA TYPE " + toColumn.dataType;
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("alter-" + toColumn.name + "-in-" + toTable.name);
                        }
                    }
                    if (fromColumn.modifiers.notNull && !toColumn.modifiers.notNull) {
                        var query = "ALTER TABLE " + toTable.name + " ALTER COLUMN " + toColumn.name + " DROP NOT NULL";
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("alter-" + toColumn.name + "-in-" + toTable.name);
                        }
                    }
                    else if (!fromColumn.modifiers.notNull && toColumn.modifiers.notNull) {
                        var query = "ALTER TABLE " + toTable.name + " ALTER COLUMN " + toColumn.name + " SET NOT NULL";
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("alter-" + toColumn.name + "-in-" + toTable.name);
                        }
                    }
                    if (fromColumn.modifiers.default && !toColumn.modifiers.default) {
                        var query = "ALTER TABLE " + toTable.name + " ALTER COLUMN " + toColumn.name + " DROP DEFAULT";
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("alter-" + toColumn.name + "-in-" + toTable.name);
                        }
                    }
                    else if (!fromColumn.modifiers.default && toColumn.modifiers.default) {
                        var query = "ALTER TABLE " + toTable.name + " ALTER COLUMN " + toColumn.name + " SET DEFAULT " + toColumn.modifiers.default;
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("alter-" + toColumn.name + "-in-" + toTable.name);
                        }
                    }
                }
            });
            getColumns(fromTable).forEach(function (fromColumn) {
                var toColumn = toTable.columns[fromColumn.name];
                if (!toColumn) {
                    // TODO: Check if this was a rename.
                    var query = "ALTER TABLE " + toTable.name + " DROP COLUMN " + fromColumn.name;
                    from.simulateQuery(query);
                    queries.push(query);
                    if (shouldGenerateNames) {
                        names.push("drop-" + fromColumn.name + "-in-" + toTable.name);
                    }
                }
            });
            fromTable.indexes.forEach(function (fromIndex) {
                var toIndex = toTable.indexes.find(function (toIndex) { return lodash_1.isEqual(toIndex, fromIndex); });
                if (!toIndex) {
                    var query = "ALTER TABLE " + toTable.name + " DROP CONSTRAINT " + fromIndex.name;
                    from.simulateQuery(query);
                    queries.push(query);
                    if (shouldGenerateNames) {
                        names.push("drop-constraint-" + fromIndex.name + "-in-" + toTable.name);
                    }
                }
            });
            toTable.indexes.forEach(function (toIndex) {
                var fromIndex = fromTable.indexes.find(function (fromIndex) { return lodash_1.isEqual(fromIndex, toIndex); });
                if (!fromIndex) {
                    if (toIndex.type === "primaryKey") {
                        var query = "ALTER TABLE " + toTable.name + " ADD CONSTRAINT " + toIndex.name + " PRIMARY KEY (" + toIndex.columns.join(", ") + ")";
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("add-primary-key-to-" + toIndex.columns.join("-") + "-in-" + toTable.name);
                        }
                    }
                    else if (toIndex.type === "unique") {
                        var query = "ALTER TABLE " + toTable.name + " ADD CONSTRAINT " + toIndex.name + " UNIQUE (" + toIndex.columns.join(", ") + ")";
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("add-unique-to-" + toIndex.columns.join("-") + "-in-" + toTable.name);
                        }
                    }
                    else if (toIndex.type === "foreignKey") {
                        var query = "ALTER TABLE " + toTable.name + " ADD CONSTRAINT " + toIndex.name + " FOREIGN KEY (" + toIndex.columns.join(", ") + ") REFERENCES " + toIndex.tableName + (toIndex.referenceColumns.length > 0 ? " (" + toIndex.referenceColumns.join(", ") + ")" : "");
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("add-foreign-key-to-" + toIndex.columns.join("-") + "-in-" + toTable.name);
                        }
                    }
                    else if (toIndex.type === "check") {
                        var query = "ALTER TABLE " + toTable.name + " ADD CONSTRAINT " + toIndex.name + " CHECK (" + toIndex.expression + ")";
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("add-check-in-" + toTable.name);
                        }
                    }
                    else {
                        // Unknown index type.
                    }
                }
            });
        }
    });
    getTables(from.tables).forEach(function (fromTable) {
        var toTable = to.tables[fromTable.name];
        if (!toTable) {
            var query = "DROP TABLE " + fromTable.name;
            from.simulateQuery(query);
            queries.push(query);
            if (shouldGenerateNames) {
                names.push("drop-table-" + fromTable.name);
            }
        }
    });
    getTypes(to.types).forEach(function (toType) {
        var fromType = from.types[toType.name];
        if (!fromType) {
            var query = "CREATE TYPE " + toType.name + " AS ENUM (" + toType.labels.map(function (label) { return "'" + label + "'"; }).join(", ") + ")";
            from.simulateQuery(query);
            queries.push(query);
            if (shouldGenerateNames) {
                names.push("create-" + toType.name);
            }
        }
        else {
            var previousLabels_1 = fromType.labels.reduce(function (labels, label, index) {
                labels[label] = index;
                return labels;
            }, {});
            toType.labels.forEach(function (label, index) {
                var exists = previousLabels_1[label] >= 0;
                if (!exists) {
                    if (index === 0) {
                        var query = "ALTER TYPE " + toType.name + " ADD VALUE '" + label + "' BEFORE '" + fromType.labels[0] + "'";
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("add-" + label + "-to-" + toType.name);
                        }
                    }
                    else {
                        var query = "ALTER TYPE " + toType.name + " ADD VALUE '" + label + "' AFTER '" + fromType.labels[index - 1] + "'";
                        from.simulateQuery(query);
                        queries.push(query);
                        if (shouldGenerateNames) {
                            names.push("add-" + label + "-to-" + toType.name);
                        }
                    }
                }
            });
        }
    });
    getTypes(from.types).forEach(function (fromType) {
        var toType = to.types[fromType.name];
        if (!toType) {
            var query = "DROP TYPE " + fromType.name;
            from.simulateQuery(query);
            queries.push(query);
            if (shouldGenerateNames) {
                names.push("drop-type-" + fromType.name);
            }
        }
    });
    return {
        queries: queries,
        names: names,
    };
};
exports.default = exports.createSql;
//# sourceMappingURL=index.js.map