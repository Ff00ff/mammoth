"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Unsafe = /** @class */ (function () {
    function Unsafe(sql) {
        this.sql = sql;
    }
    Unsafe.prototype.toString = function () {
        return this.sql;
    };
    return Unsafe;
}());
exports.Unsafe = Unsafe;
//# sourceMappingURL=unsafe.js.map