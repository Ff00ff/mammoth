"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: We could also immediately generate the AST from here?
exports.generateCreateTableSql = function (table) {
    var columns = table.getColumns().map(function (column) {
        var parts = [
            "  " + column.name,
            column.dataType,
        ];
        if (column.config.primary) {
            parts.push("PRIMARY KEY");
        }
        if (column.config.notNull) {
            parts.push("NOT NULL");
        }
        if (column.config.default) {
            // TODO: Can we escape this?
            parts.push("DEFAULT " + column.config.default);
        }
        if (column.config.check) {
            // TODO: Can we escape this?
            parts.push("CHECK (" + column.config.check + ")");
        }
        if (column.config.unique) {
            parts.push("UNIQUE");
        }
        if (column.config.references) {
            parts.push("REFERENCES " + column.config.references.tableName + " (" + column.config.references.columnName + ")");
        }
        return parts.join(' ');
    });
    return "CREATE TABLE " + table.getName() + " (\n" + columns.join(",\n") + "\n)";
};
//# sourceMappingURL=table.js.map