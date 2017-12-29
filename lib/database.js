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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var pg = require("pg");
var url = require("url");
var query_1 = require("./query");
var table_1 = require("./table");
var tokens_1 = require("./tokens");
var transaction_1 = require("./transaction");
var unsafe_1 = require("./unsafe");
var createTable = function (table, tableName) {
    var newTable = new table_1.TableWrapper(table, tableName);
    return newTable;
};
var Database = /** @class */ (function () {
    function Database(tableNames) {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is not set.");
        }
        this.pool = this.createPool(String(process.env.DATABASE_URL), {
            min: process.env.DB_MIN_POOL_SIZE
                ? parseInt(process.env.DB_MIN_POOL_SIZE, 10)
                : undefined,
            max: process.env.DB_MAX_POOL_SIZE
                ? parseInt(process.env.DB_MAX_POOL_SIZE, 10)
                : undefined,
        });
        this.tableNames = tableNames;
    }
    Database.prototype.createPool = function (databaseUrl, options) {
        var _a = url.parse(databaseUrl), auth = _a.auth, hostname = _a.hostname, port = _a.port, pathname = _a.pathname;
        var _b = (auth || '').split(':'), user = _b[0], password = _b[1];
        var config = __assign({}, options, { user: user,
            password: password, host: hostname, port: parseInt(port || '5432', 10), database: (pathname || '').slice(1), ssl: process.env.DB_DISABLE_SSL !== 'true' });
        return new pg.Pool(config);
    };
    Database.prototype.sql = function (strings) {
        var parameters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            parameters[_i - 1] = arguments[_i];
        }
        var text = strings.reduce(function (query, string, index) { return query + String(index + 1) + string; }, '');
        return this.exec(text, parameters);
    };
    Database.prototype.transaction = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var client, transaction, e_1, e2_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pool.connect()];
                    case 1:
                        client = _a.sent();
                        transaction = new transaction_1.Transaction(client);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 11]);
                        return [4 /*yield*/, transaction.begin()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, Promise.resolve(callback(transaction))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        client.release();
                        return [3 /*break*/, 11];
                    case 6:
                        e_1 = _a.sent();
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        e2_1 = _a.sent();
                        // If rollback fails we assume this client is bugged and we don't want to give it back
                        // to the pool. By passing in the error we effectively tell the pool to disconnect and
                        // forget about the client.
                        client.release(e2_1);
                        return [3 /*break*/, 10];
                    case 10:
                        client.release();
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.exec = function (text, parameters) {
        if (parameters === void 0) { parameters = []; }
        return __awaiter(this, void 0, void 0, function () {
            var client, result, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        return [4 /*yield*/, this.pool.connect()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.query(text, parameters)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 3:
                        e_2 = _a.sent();
                        e_2.query = text;
                        throw e_2;
                    case 4:
                        if (client) {
                            client.release();
                        }
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.now = function () {
        var query = new query_1.PartialQuery();
        query.tokens.push(new tokens_1.StringToken("NOW()"));
        return query;
    };
    Database.prototype.default = function () {
        return new Default();
    };
    Database.prototype.uuidGenerateV4 = function () {
        return new unsafe_1.Unsafe("uuid_generate_v4()");
    };
    Database.prototype.excluded = function (_column) {
        //
    };
    Database.prototype.exists = function (_query) {
        //
    };
    Database.prototype.not = function (tokenable) {
        return new query_1.PartialQuery(new tokens_1.StringToken("NOT"), new tokens_1.GroupToken(tokenable.tokens));
    };
    return Database;
}());
exports.Database = Database;
var Keyword = /** @class */ (function () {
    function Keyword() {
    }
    Keyword.prototype.toTokens = function () {
        return [
            new tokens_1.StringToken(this.toString()),
        ];
    };
    return Keyword;
}());
exports.Keyword = Keyword;
var Default = /** @class */ (function (_super) {
    __extends(Default, _super);
    function Default() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Default.prototype.toString = function () { return "DEFAULT"; };
    return Default;
}(Keyword));
exports.Default = Default;
exports.createDatabase = function (tables) {
    var tableNames = Object.keys(tables);
    var database = new Database(tableNames);
    tableNames.forEach(function (tableName) {
        var table = tables[tableName];
        console.log("Create table " + tableName);
        database[tableName] = createTable(table, tableName);
    });
    tableNames.forEach(function (tableName) {
        var table = database[tableName];
        table.init(database);
    });
    return database;
};
//# sourceMappingURL=database.js.map