"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("./database");
var tokens_1 = require("./tokens");
var QueryBuilder = /** @class */ (function () {
    function QueryBuilder() {
        this.tokens = [];
    }
    return QueryBuilder;
}());
exports.QueryBuilder = QueryBuilder;
exports.createState = function (tokens, numberOfParameters) {
    var initialState = {
        text: [],
        parameters: [],
    };
    return tokens.reduce(function (tokenState, token) {
        return token.reduce(tokenState, tokenState.parameters.length + numberOfParameters);
    }, initialState);
};
var Query = /** @class */ (function () {
    function Query(table) {
        this.tokens = [];
        this.type = 'COUNT';
        this.table = table;
    }
    Query.prototype.then = function (onFulfilled, onRejected) {
        return __awaiter(this, void 0, void 0, function () {
            var query, result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        query = this.toQuery();
                        return [4 /*yield*/, this.table.getDb().exec(query.text, query.parameters)];
                    case 1:
                        result = _a.sent();
                        if (onFulfilled) {
                            switch (this.type) {
                                case 'COUNT': return [2 /*return*/, onFulfilled(result.rowCount)];
                                case 'ROWS': return [2 /*return*/, onFulfilled(result.rows)];
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        if (onRejected) {
                            return [2 /*return*/, onRejected(e_1)];
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Query.prototype.toQuery = function () {
        var state = exports.createState(this.tokens, 0);
        return {
            text: state.text.join(' '),
            parameters: state.parameters,
        };
    };
    Query.prototype.append = function (strings, parameters) {
        if (!strings) {
            return;
        }
        for (var i = 0; i < strings.length; i += 1) {
            var string = strings[i];
            if (string.length > 0) {
                this.tokens.push(new tokens_1.StringToken(string));
            }
            if (parameters && i < parameters.length) {
                var parameter = parameters[i];
                if (parameter instanceof Query) {
                    var query = parameter;
                    (_a = this.tokens).push.apply(_a, query.tokens);
                }
                else if (parameter instanceof tokens_1.Token) {
                    this.tokens.push(parameter);
                }
                else if (Array.isArray(parameter) && parameter.length > 0 && parameter[0] instanceof Query) {
                    // We assume everything in the array is a query now. This is tricky.
                    for (var j = 0, jl = parameter.length; j < jl; j++) {
                        var subinstance = parameter[j];
                        (_b = this.tokens).push.apply(_b, subinstance.tokens);
                        if (j + 1 < jl) {
                            this.tokens.push(new tokens_1.StringToken(', '));
                        }
                    }
                }
                else {
                    this.tokens.push(new tokens_1.ParameterToken(parameter));
                }
            }
        }
        var _a, _b;
    };
    Query.prototype.selectWithAlias = function (columns) {
        this.type = 'ROWS';
        this.append(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT"], ["SELECT"])));
        this.tokens.push(new tokens_1.SeparatorToken(",", Object.keys(columns)
            .map(function (alias) {
            var column = columns[alias];
            // TODO: if this is an AggregateType get the correct sql.
            return new tokens_1.StringToken(column.table.getName() + "." + column.name + " AS \"" + alias + "\"");
        })));
        return this;
    };
    Query.prototype.selectWithStrings = function (columnNameA, columnNameB, columnNameC, columnNameD, columnNameE, columnNameF, columnNameG, columnNameH) {
        var _this = this;
        this.type = 'ROWS';
        this.tokens.push(new tokens_1.StringToken("SELECT"), new tokens_1.SeparatorToken(",", [
            columnNameA,
            columnNameB,
            columnNameC,
            columnNameD,
            columnNameE,
            columnNameF,
            columnNameG,
            columnNameH,
        ]
            .filter(function (columnName) { return columnName; })
            .map(function (columnName) {
            var column = _this.table.getColumn(columnName);
            return new tokens_1.StringToken(_this.table.getName() + "." + column.name);
        })));
        return this;
    };
    Query.prototype.from = function (table) {
        this.append(templateObject_2 || (templateObject_2 = __makeTemplateObject(["FROM"], ["FROM"])));
        this.tokens.push(new tokens_1.StringToken(table.getName()));
        return this;
    };
    Query.prototype.limit = function (limit) {
        this.append(templateObject_3 || (templateObject_3 = __makeTemplateObject(["LIMIT"], ["LIMIT"])));
        if (typeof limit === 'number') {
            this.tokens.push(new tokens_1.StringToken(String(limit)));
        }
        else {
            this.tokens.push(new tokens_1.StringToken("ALL"));
        }
        return this;
    };
    Query.prototype.offset = function (offset) {
        this.tokens.push(new tokens_1.StringToken("OFFSET " + offset));
        return this;
    };
    Query.prototype.innerJoin = function (table) {
        this.tokens.push(new tokens_1.StringToken("INNER JOIN"), new tokens_1.StringToken(table.getName()));
        return this;
    };
    Query.prototype.leftJoin = function (table) {
        this.tokens.push(new tokens_1.StringToken("LEFT JOIN"), new tokens_1.StringToken(table.getName()));
        return this;
    };
    Query.prototype.rightJoin = function (table) {
        this.tokens.push(new tokens_1.StringToken("RIGHT JOIN"), new tokens_1.StringToken(table.getName()));
        return this;
    };
    Query.prototype.leftOuterJoin = function (table) {
        this.tokens.push(new tokens_1.StringToken("LEFT OUTER JOIN"), new tokens_1.StringToken(table.getName()));
        return this;
    };
    Query.prototype.rightOuterJoin = function (table) {
        this.tokens.push(new tokens_1.StringToken("RIGHT OUTER JOIN"), new tokens_1.StringToken(table.getName()));
        return this;
    };
    // TODO: if we set a type of the joined table somewhere we could make this a bit safer?
    Query.prototype.on = function (tokenable) {
        this.append(templateObject_4 || (templateObject_4 = __makeTemplateObject(["ON"], ["ON"])));
        (_a = this.tokens).push.apply(_a, tokenable.tokens);
        return this;
        var _a;
    };
    Query.prototype.where = function (tokenable) {
        this.append(templateObject_5 || (templateObject_5 = __makeTemplateObject(["WHERE"], ["WHERE"])));
        (_a = this.tokens).push.apply(_a, tokenable.tokens);
        return this;
        var _a;
    };
    Query.prototype.getColumn = function (key) {
        return this.table[key];
    };
    Query.prototype.insert = function (object) {
        var _this = this;
        var value = object;
        // TODO: Maybe we can change this to one tokens.push call? Let's first run a benchmark to see what is better.
        this.append(templateObject_6 || (templateObject_6 = __makeTemplateObject(["INSERT INTO"], ["INSERT INTO"])));
        this.tokens.push(new tokens_1.StringToken(this.table.getName()));
        var keys = Object.keys(object).filter(function (key) { return value[key] !== null; });
        if (keys.length === 0) {
            this.tokens.push(new tokens_1.StringToken("DEFAULT VALUES"));
        }
        else {
            this.tokens.push(new tokens_1.GroupToken([
                new tokens_1.SeparatorToken(',', keys.map(function (key) { return _this.getColumn(key); })
                    .filter(function (column) { return Boolean(column); })
                    .map(function (column) { return new tokens_1.StringToken(column.name); })),
            ]));
            this.append(templateObject_7 || (templateObject_7 = __makeTemplateObject(["VALUES"], ["VALUES"])));
            this.tokens.push(new tokens_1.GroupToken([
                new tokens_1.SeparatorToken(',', keys.map(function (key) { return new tokens_1.ParameterToken(value[key]); })),
            ]));
        }
        return this;
    };
    Query.prototype.update = function (object) {
        var _this = this;
        var keys = Object.keys(object);
        // TODO: What if keys is empty? update(object: {}): void?
        this.tokens.push(new tokens_1.StringToken("UPDATE"), new tokens_1.StringToken(this.table.getName()), new tokens_1.StringToken("SET"), new tokens_1.SeparatorToken(",", keys
            .map(function (columnName) { return _this.getColumn(columnName); })
            .filter(function (column) { return Boolean(column); })
            .map(function (column) {
            var value = object[column.key];
            return value && value.toTokens
                ? new tokens_1.CollectionToken([
                    new tokens_1.StringToken(column.name),
                    new tokens_1.StringToken("=")
                ].concat(value.toTokens()))
                : new tokens_1.CollectionToken([
                    new tokens_1.StringToken(column.name),
                    new tokens_1.StringToken("="),
                    new tokens_1.ParameterToken(value),
                ]);
        })));
        return this;
    };
    Query.prototype.onConflict = function () {
        var _this = this;
        var columnNames = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            columnNames[_i] = arguments[_i];
        }
        // TODO: It's also possible to specify ON CONSTRAINT :constraintName.
        this.tokens.push(new tokens_1.StringToken("ON CONFLICT"), new tokens_1.GroupToken([
            new tokens_1.SeparatorToken(",", columnNames
                .map(function (columnName) { return _this.getColumn(columnName); })
                .filter(function (column) { return Boolean(column); })
                .map(function (column) { return new tokens_1.StringToken(column.key); })),
        ]));
        return this;
    };
    Query.prototype.doNothing = function () {
        this.tokens.push(new tokens_1.StringToken("DO NOTHING"));
        return this;
    };
    Query.prototype.doUpdate = function (object) {
        var _this = this;
        var keys = Object.keys(object);
        this.tokens.push(new tokens_1.StringToken("DO UPDATE SET"), new tokens_1.SeparatorToken(",", keys
            .map(function (columnName) { return _this.getColumn(columnName); })
            .filter(function (column) { return Boolean(column); })
            .map(function (column) {
            var value = object[column.key];
            return new tokens_1.CollectionToken([
                new tokens_1.StringToken(column.name),
                new tokens_1.StringToken("="),
                value instanceof database_1.Keyword
                    ? new tokens_1.StringToken(value.toString())
                    : new tokens_1.ParameterToken(value),
            ]);
        })));
        return this;
    };
    Query.prototype.having = function (tokenable) {
        this.append(templateObject_8 || (templateObject_8 = __makeTemplateObject(["HAVING"], ["HAVING"])));
        (_a = this.tokens).push.apply(_a, tokenable.tokens);
        return this;
        var _a;
    };
    Query.prototype.orderBy = function () {
        var tokenables = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tokenables[_i] = arguments[_i];
        }
        this.tokens.push(new tokens_1.StringToken("ORDER BY"), new tokens_1.SeparatorToken(",", (_a = []).concat.apply(_a, tokenables.map(function (tokenable) { return tokenable.tokens; }))));
        return this;
        var _a;
    };
    Query.prototype.groupBy = function () {
        var _this = this;
        var columnNames = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            columnNames[_i] = arguments[_i];
        }
        this.tokens.push(new tokens_1.StringToken("GROUP BY"), new tokens_1.SeparatorToken(",", columnNames
            .map(function (columnName) { return typeof columnName === 'string'
            ? _this.getColumn(columnName)
            : columnName; })
            .filter(function (column) { return Boolean(column); })
            .map(function (column) { return new tokens_1.StringToken(_this.table.getName() + "." + column.name); })));
        return this;
    };
    Query.prototype.returning = function (columnNameA, columnNameB, columnNameC, columnNameD, columnNameE, columnNameF, columnNameG, columnNameH) {
        var _this = this;
        this.type = 'ROWS';
        this.tokens.push(new tokens_1.StringToken("RETURNING"), new tokens_1.SeparatorToken(",", [
            columnNameA,
            columnNameB,
            columnNameC,
            columnNameD,
            columnNameE,
            columnNameF,
            columnNameG,
            columnNameH,
        ]
            .filter(function (columnName) { return columnName; })
            .map(function (columnName) {
            var column = _this.table.getColumn(columnName);
            return new tokens_1.StringToken(_this.table.getName() + "." + column.name + " AS \"" + column.key + "\"");
        })));
        return this;
    };
    return Query;
}());
exports.Query = Query;
;
var PartialQuery = /** @class */ (function () {
    function PartialQuery() {
        var tokens = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tokens[_i] = arguments[_i];
        }
        this.tokens = [];
        this.tokens = tokens || [];
    }
    PartialQuery.prototype.toTokens = function () {
        return this.tokens;
    };
    PartialQuery.prototype.add = function (partialQuery, separator) {
        (_a = this.tokens).push.apply(_a, [new tokens_1.StringToken(separator)].concat(partialQuery.tokens));
        return this;
        var _a;
    };
    PartialQuery.prototype.or = function (partialQuery) {
        return this.add(partialQuery, "OR");
    };
    PartialQuery.prototype.and = function (partialQuery) {
        return this.add(partialQuery, "AND");
    };
    PartialQuery.prototype.minus = function (string) {
        this.tokens.push(new tokens_1.StringToken("-"), new tokens_1.ParameterToken(string));
        return this;
    };
    PartialQuery.prototype.plus = function (string) {
        this.tokens.push(new tokens_1.StringToken("+"), new tokens_1.ParameterToken(string));
        return this;
    };
    PartialQuery.prototype.in = function (object) {
        if (object instanceof PartialQuery) {
            this.tokens.push(new tokens_1.StringToken("IN"), new tokens_1.GroupToken(object.tokens));
        }
        else if (object instanceof Query) {
            this.tokens.push(new tokens_1.StringToken("IN"), new tokens_1.GroupToken(object.tokens));
        }
        else {
            this.tokens.push(new tokens_1.StringToken("IN"), new tokens_1.GroupToken([
                new tokens_1.ParameterToken(object),
            ]));
        }
        return this;
    };
    // TODO: Move this to an order by query.
    PartialQuery.prototype.nullsFirst = function () {
        this.tokens.push(new tokens_1.StringToken("NULLS FIRST"));
        return this;
    };
    PartialQuery.prototype.nullsLast = function () {
        this.tokens.push(new tokens_1.StringToken("NULLS LAST"));
        return this;
    };
    return PartialQuery;
}());
exports.PartialQuery = PartialQuery;
var SelectQuery = /** @class */ (function (_super) {
    __extends(SelectQuery, _super);
    function SelectQuery() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SelectQuery;
}(Query));
exports.SelectQuery = SelectQuery;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8;
//# sourceMappingURL=query.js.map