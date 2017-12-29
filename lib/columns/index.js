"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var query_1 = require("../query");
var tokens_1 = require("../tokens");
var unsafe_1 = require("../unsafe");
var Column = /** @class */ (function () {
    function Column(name, config) {
        if (config === void 0) { config = {}; }
        this.name = name;
        // tslint:disable-next-line:no-object-literal-type-assertion
        this.type = {};
        // tslint:disable-next-line:no-object-literal-type-assertion
        this.insertType = {};
        // tslint:disable-next-line:no-object-literal-type-assertion
        this.selectType = {};
        // tslint:disable-next-line:no-object-literal-type-assertion
        this.updateType = {};
        this.config = config;
    }
    /** @internal */
    Column.prototype.getName = function () {
        return this.name;
    };
    /** @internal */
    Column.prototype.setName = function (name) {
        this.name = name;
    };
    /** @internal */
    Column.prototype.setKey = function (key) {
        this.key = key;
    };
    /** @internal */
    Column.prototype.setTable = function (table) {
        // TODO: why do we need the complete table here? If it's just for the table's name, can we just set the name instead?
        this.table = table;
    };
    Column.prototype.primary = function () {
        this.config.primary = true;
        return this;
    };
    Column.prototype.primaryKey = function () {
        return this.primary();
    };
    Column.prototype.unique = function () {
        this.config.unique = true;
        return this;
    };
    Column.prototype.notNull = function () {
        this.config.notNull = true;
        return this;
    };
    Column.prototype.check = function (sql) {
        this.config.check = sql;
        return this;
    };
    Column.prototype.default = function (sql) {
        this.config.default = sql instanceof unsafe_1.Unsafe
            ? sql.toString()
            : sql;
        return this;
    };
    /** @internal */
    Column.prototype.createReference = function (db) {
        if (this.config.columnFunction) {
            var column = this.config.columnFunction(db);
            this.config.references = {
                tableName: column.table.getName(),
                columnName: column.name,
            };
            this.config.columnFunction = undefined;
        }
    };
    Column.prototype.references = function (columnFunction) {
        this.config.columnFunction = columnFunction;
        return this;
    };
    // TODO: Move everything below this comment to a separate class e.g. QueryableColumn.
    // That way we can separate the schema-related methods and the query-related methods.
    Column.prototype.compare = function (value, comparator) {
        var query = new query_1.PartialQuery();
        query.tokens.push(new tokens_1.StringToken(this.table.getName() + "." + this.name), new tokens_1.StringToken(comparator));
        if (value instanceof Column) {
            query.tokens.push(new tokens_1.StringToken(value.table.getName() + "." + value.name));
        }
        else if (value instanceof query_1.PartialQuery) {
            (_a = query.tokens).push.apply(_a, value.tokens);
        }
        else {
            query.tokens.push(new tokens_1.ParameterToken(value));
        }
        return query;
        var _a;
    };
    Column.prototype.isNull = function () {
        var query = new query_1.PartialQuery();
        query.tokens.push(new tokens_1.StringToken(this.table.getName() + "." + this.name), new tokens_1.StringToken("IS NULL"));
        return query;
    };
    Column.prototype.isNotNull = function () {
        var query = new query_1.PartialQuery();
        query.tokens.push(new tokens_1.StringToken(this.table.getName() + "." + this.name), new tokens_1.StringToken("IS NOT NULL"));
        return query;
    };
    Column.prototype.asc = function () {
        return new query_1.PartialQuery(new tokens_1.StringToken(this.table.getName() + "." + this.name), new tokens_1.StringToken("ASC"));
    };
    Column.prototype.desc = function () {
        return new query_1.PartialQuery(new tokens_1.StringToken(this.table.getName() + "." + this.name), new tokens_1.StringToken("DESC"));
    };
    Column.prototype.in = function (array) {
        return new query_1.PartialQuery(new tokens_1.StringToken(this.table.getName() + "." + this.name), new tokens_1.StringToken("IN"), new tokens_1.GroupToken([new tokens_1.ParameterToken(array)]));
    };
    Column.prototype.aggregate = function (aggregateType) {
        // TODO: the selectType probably needs an update depending on the aggregate type?
        return new AggregateColumn(aggregateType, this.name, this.key);
    };
    Column.prototype.count = function () { return this.aggregate("COUNT"); };
    Column.prototype.sum = function () { return this.aggregate("SUM"); };
    Column.prototype.min = function () { return this.aggregate("MIN"); };
    Column.prototype.max = function () { return this.aggregate("MAX"); };
    Column.prototype.avg = function () { return this.aggregate("AVG"); };
    Column.prototype.operate = function (operator, value) {
        return new query_1.PartialQuery(new tokens_1.StringToken(this.table.getName() + "." + this.name), new tokens_1.StringToken(operator), new tokens_1.ParameterToken(value));
    };
    // TODO: should we add these on specific column types only? E.g. NumberColumn.
    Column.prototype.plus = function (value) { return this.operate("+", value); };
    Column.prototype.minus = function (value) { return this.operate("+", value); };
    Column.prototype.multiply = function (value) { return this.operate("+", value); };
    Column.prototype.divide = function (value) { return this.operate("/", value); };
    Column.prototype.modulo = function (value) { return this.operate("%", value); };
    // TODO: should this only be on TextColumn exclusively?
    Column.prototype.concat = function (value) {
        return new query_1.PartialQuery(new tokens_1.StringToken(this.table.getName() + "." + this.name), new tokens_1.StringToken("||"), 
        // TODO: What if this is an aggregate column? We should have a toSql/toTokens method or something?
        value instanceof Column
            ? new tokens_1.StringToken(value.table.getName() + "." + value.name)
            : new tokens_1.ParameterToken(value));
    };
    Column.prototype.between = function (a, b) {
        return new query_1.PartialQuery(new tokens_1.StringToken(this.table.getName() + "." + this.name), new tokens_1.StringToken("BETWEEN"), new tokens_1.ParameterToken(a), new tokens_1.StringToken("AND"), new tokens_1.ParameterToken(b));
    };
    Column.prototype.eq = function (value) { return this.compare(value, "="); };
    Column.prototype.ne = function (value) { return this.compare(value, "!="); };
    Column.prototype.gt = function (value) { return this.compare(value, ">"); };
    Column.prototype.gte = function (value) { return this.compare(value, ">="); };
    Column.prototype.lt = function (value) { return this.compare(value, ">="); };
    Column.prototype.lte = function (value) { return this.compare(value, "<="); };
    return Column;
}());
exports.Column = Column;
var AggregateColumn = /** @class */ (function (_super) {
    __extends(AggregateColumn, _super);
    function AggregateColumn(aggregateType, name, key) {
        var _this = _super.call(this) || this;
        _this.aggregateType = aggregateType;
        _this.name = name;
        _this.key = key;
        return _this;
    }
    return AggregateColumn;
}(Column));
exports.AggregateColumn = AggregateColumn;
var TextColumn = /** @class */ (function (_super) {
    __extends(TextColumn, _super);
    function TextColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataType = 'TEXT';
        return _this;
    }
    return TextColumn;
}(Column));
exports.TextColumn = TextColumn;
var CitextColumn = /** @class */ (function (_super) {
    __extends(CitextColumn, _super);
    function CitextColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataType = 'CITEXT';
        return _this;
    }
    return CitextColumn;
}(Column));
exports.CitextColumn = CitextColumn;
var CaseInsensitiveTextColumn = /** @class */ (function (_super) {
    __extends(CaseInsensitiveTextColumn, _super);
    function CaseInsensitiveTextColumn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CaseInsensitiveTextColumn;
}(CitextColumn));
exports.CaseInsensitiveTextColumn = CaseInsensitiveTextColumn;
var IntegerColumn = /** @class */ (function (_super) {
    __extends(IntegerColumn, _super);
    function IntegerColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataType = 'INTEGER';
        return _this;
    }
    return IntegerColumn;
}(Column));
exports.IntegerColumn = IntegerColumn;
var DecimalColumn = /** @class */ (function (_super) {
    __extends(DecimalColumn, _super);
    function DecimalColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataType = 'DECIMAL';
        return _this;
    }
    return DecimalColumn;
}(Column));
exports.DecimalColumn = DecimalColumn;
var SerialColumn = /** @class */ (function (_super) {
    __extends(SerialColumn, _super);
    function SerialColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataType = 'SERIAL';
        return _this;
    }
    return SerialColumn;
}(Column));
exports.SerialColumn = SerialColumn;
var JSONColumn = /** @class */ (function (_super) {
    __extends(JSONColumn, _super);
    function JSONColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataType = 'JSON';
        return _this;
    }
    return JSONColumn;
}(Column));
exports.JSONColumn = JSONColumn;
var JSONBColumn = /** @class */ (function (_super) {
    __extends(JSONBColumn, _super);
    function JSONBColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataType = 'JSONB';
        return _this;
    }
    return JSONBColumn;
}(Column));
exports.JSONBColumn = JSONBColumn;
var TimestampWithTimeZoneColumn = /** @class */ (function (_super) {
    __extends(TimestampWithTimeZoneColumn, _super);
    function TimestampWithTimeZoneColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataType = 'TIMESTAMP WITH TIME ZONE';
        return _this;
    }
    return TimestampWithTimeZoneColumn;
}(Column));
exports.TimestampWithTimeZoneColumn = TimestampWithTimeZoneColumn;
var TimestampWithoutTimeZoneColumn = /** @class */ (function (_super) {
    __extends(TimestampWithoutTimeZoneColumn, _super);
    function TimestampWithoutTimeZoneColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataType = 'TIMESTAMP WITHOUT TIME ZONE';
        return _this;
    }
    return TimestampWithoutTimeZoneColumn;
}(Column));
exports.TimestampWithoutTimeZoneColumn = TimestampWithoutTimeZoneColumn;
var UuidColumn = /** @class */ (function (_super) {
    __extends(UuidColumn, _super);
    function UuidColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataType = 'UUID';
        return _this;
    }
    return UuidColumn;
}(Column));
exports.UuidColumn = UuidColumn;
var StringColumn = /** @class */ (function (_super) {
    __extends(StringColumn, _super);
    function StringColumn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return StringColumn;
}(TextColumn));
exports.StringColumn = StringColumn;
var NumberColumn = /** @class */ (function (_super) {
    __extends(NumberColumn, _super);
    function NumberColumn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NumberColumn;
}(IntegerColumn));
exports.NumberColumn = NumberColumn;
var DateColumn = /** @class */ (function (_super) {
    __extends(DateColumn, _super);
    function DateColumn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DateColumn;
}(TimestampWithTimeZoneColumn));
exports.DateColumn = DateColumn;
//# sourceMappingURL=index.js.map