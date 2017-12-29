"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Transaction = /** @class */ (function () {
    function Transaction(client) {
        this.client = client;
    }
    Transaction.prototype.sql = function (strings) {
        var parameters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            parameters[_i - 1] = arguments[_i];
        }
        var text = strings.reduce(function (query, string, index) { return query + String(index + 1) + string; }, '');
        try {
            return this.client.query(text, parameters);
        }
        catch (e) {
            e.query = text;
            throw e;
        }
    };
    Transaction.prototype.begin = function () {
        return this.client.query("BEGIN");
    };
    Transaction.prototype.commit = function () {
        return this.client.query("COMMIT");
    };
    Transaction.prototype.rollback = function () {
        return this.client.query("ROLLBACK");
    };
    return Transaction;
}());
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map