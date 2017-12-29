"use strict";
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var minimist = require("minimist");
var path = require("path");
var migrations_1 = require("./migrations");
// tslint:disable-next-line:prefer-array-literal
var addSpaces = function (count) { return new Array(count + 1).join(' '); };
var loadDatabase = function (databasePath) {
    require("ts-node").register();
    var object = require(databasePath);
    return object.default || object.db;
};
var argv = minimist(process.argv.slice(2));
var main = function () { return __awaiter(_this, void 0, void 0, function () {
    var _a, topic, action, _b, databasePath, _c, migrationsDir, db, e_1, lines, errorPosition, pos, i, il, numberOfTabs, lineLength, line, left;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = argv._, topic = _a[0], action = _a[1];
                _b = argv.databasePath, databasePath = _b === void 0 ? path.join(process.cwd(), "src", "db.ts") : _b, _c = argv.migrationsDir, migrationsDir = _c === void 0 ? path.join(process.cwd(), "migrations") : _c;
                _d.label = 1;
            case 1:
                _d.trys.push([1, 9, 10, 11]);
                db = loadDatabase(databasePath);
                if (!db) {
                    throw new Error("Could not find db at " + databasePath + ".");
                }
                if (!(topic === 'migrations')) return [3 /*break*/, 8];
                if (!(action === "generate")) return [3 /*break*/, 3];
                return [4 /*yield*/, migrations_1.generate(db, migrationsDir)];
            case 2:
                _d.sent();
                return [3 /*break*/, 7];
            case 3:
                if (!(action === "apply")) return [3 /*break*/, 5];
                return [4 /*yield*/, migrations_1.apply(db, migrationsDir)];
            case 4:
                _d.sent();
                return [3 /*break*/, 7];
            case 5:
                if (!(action === "rollback")) return [3 /*break*/, 7];
                return [4 /*yield*/, migrations_1.rollback(db, migrationsDir)];
            case 6:
                _d.sent();
                return [3 /*break*/, 7];
            case 7: return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 11];
            case 9:
                e_1 = _d.sent();
                if (e_1.query && (e_1.code === '42601' || e_1.sqlState === '42601')) {
                    console.log('');
                    console.log('Error: ' + e_1.message);
                    console.log('');
                    lines = e_1.query.split('\n');
                    errorPosition = parseInt(e_1.position, 10);
                    pos = 0;
                    for (i = 0, il = lines.length; i < il; i++) {
                        numberOfTabs = (lines[i].match(/\t/g) || []).length;
                        lineLength = lines[i].length + 1;
                        line = lines[i].replace(/\t/g, '    ');
                        console.log(chalk_1.default.bgRed(line));
                        if (errorPosition > pos && errorPosition < pos + lineLength) {
                            left = (errorPosition - pos);
                            console.log(addSpaces(left + numberOfTabs * 3 - 1) + '^');
                        }
                        pos += lineLength;
                    }
                }
                else {
                    console.log(e_1);
                    if (e_1.query) {
                        console.log(e_1.query);
                    }
                }
                return [3 /*break*/, 11];
            case 10:
                if (db) {
                    db.pool.end();
                }
                return [7 /*endfinally*/];
            case 11: return [2 /*return*/];
        }
    });
}); };
main()
    .then(function () {
    //
})
    .catch(function (error) {
    console.log(error);
});
//# sourceMappingURL=index.js.map