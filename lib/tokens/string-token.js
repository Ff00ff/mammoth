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
var token_1 = require("./token");
var StringToken = /** @class */ (function (_super) {
    __extends(StringToken, _super);
    function StringToken(string) {
        var _this = _super.call(this) || this;
        _this.string = string;
        return _this;
    }
    StringToken.prototype.reduce = function (state) {
        state.text.push(this.string);
        return state;
    };
    return StringToken;
}(token_1.Token));
exports.StringToken = StringToken;
//# sourceMappingURL=string-token.js.map