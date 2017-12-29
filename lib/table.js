"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var query_1 = require("./query");
var Table = /** @class */ (function () {
    function Table() {
    }
    return Table;
}());
exports.Table = Table;
var toSnakeCase = function (string) { return string.replace(/([^A-Z]|[A-Z]{1,})([A-Z])/g, '$1_$2').toLowerCase(); };
var TableWrapper = /** @class */ (function () {
    function TableWrapper(table, name) {
        var _this = this;
        this.$name = toSnakeCase(name);
        this.$columnNames = Object.keys(table);
        var self = this;
        this.$columnNames.forEach(function (key) {
            var column = table[key];
            if (!column.getName()) {
                var columnName = toSnakeCase(key);
                column.setName(columnName);
            }
            column.setKey(key);
            // TODO: do we really need to set the complete table or can we just set the name?
            column.setTable(_this);
            if (self[key]) {
                throw new Error("Column `" + key + "` in table `" + name + "` collides with property of the same name in TableWrapper class.");
            }
            self[key] = table[key];
        });
    }
    TableWrapper.prototype.init = function (db) {
        this.$db = db;
        var self = this;
        this.$columnNames.forEach(function (columnName) {
            var column = self[columnName];
            column.createReference(db);
        });
    };
    TableWrapper.prototype.getColumns = function () {
        var _this = this;
        return this.$columnNames.map(function (columnName) { return _this.getColumn(columnName); });
    };
    TableWrapper.prototype.getColumn = function (columnName) {
        return this[columnName];
    };
    /** @internal */
    TableWrapper.prototype.getName = function () {
        return this.$name;
    };
    /** @internal */
    TableWrapper.prototype.getDb = function () {
        return this.$db;
    };
    TableWrapper.prototype.query = function () {
        return new query_1.Query(this);
    };
    TableWrapper.prototype.select = function (columnNameA, columnNameB, columnNameC, columnNameD, columnNameE, columnNameF, columnNameG, columnNameH) {
        if (typeof columnNameA === 'object') {
            return this.query().selectWithAlias(columnNameA);
        }
        return this.query().selectWithStrings(columnNameA, columnNameB, columnNameC, columnNameD, columnNameE, columnNameF, columnNameG, columnNameH);
    };
    TableWrapper.prototype.object = function (object) {
        return object;
    };
    TableWrapper.prototype.insert = function (object) {
        return this.query().insert(object);
    };
    TableWrapper.prototype.update = function (object) {
        return this.query().update(object);
    };
    return TableWrapper;
}());
exports.TableWrapper = TableWrapper;
;
//# sourceMappingURL=table.js.map