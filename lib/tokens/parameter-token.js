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
var ParameterToken = /** @class */ (function (_super) {
    __extends(ParameterToken, _super);
    function ParameterToken(parameter) {
        var _this = _super.call(this) || this;
        _this.parameter = parameter;
        return _this;
    }
    ParameterToken.prototype.reduce = function (state, numberOfParameters) {
        state.text.push("$" + (numberOfParameters + 1));
        state.parameters.push(this.parameter);
        return state;
    };
    return ParameterToken;
}(token_1.Token));
exports.ParameterToken = ParameterToken;
//# sourceMappingURL=parameter-token.js.map