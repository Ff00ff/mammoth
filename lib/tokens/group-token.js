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
var token_1 = require("./token");
var GroupToken = /** @class */ (function (_super) {
    __extends(GroupToken, _super);
    function GroupToken(tokens) {
        var _this = _super.call(this) || this;
        _this.tokens = tokens;
        return _this;
    }
    GroupToken.prototype.reduce = function (state) {
        var tokensState = query_1.createState(this.tokens, state.parameters.length);
        (_a = state.parameters).push.apply(_a, tokensState.parameters);
        var index = tokensState.text.length - 1;
        if (index >= 0) {
            tokensState.text[0] = "(" + tokensState.text[0];
            tokensState.text[tokensState.text.length - 1] = tokensState.text[tokensState.text.length - 1] + ")";
        }
        else {
            // TODO: If there are no items. Shuold we still add the () characters? Or a fallback?
        }
        (_b = state.text).push.apply(_b, tokensState.text);
        return state;
        var _a, _b;
    };
    return GroupToken;
}(token_1.Token));
exports.GroupToken = GroupToken;
//# sourceMappingURL=group-token.js.map