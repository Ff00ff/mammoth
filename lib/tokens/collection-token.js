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
var CollectionToken = /** @class */ (function (_super) {
    __extends(CollectionToken, _super);
    function CollectionToken(tokens) {
        var _this = _super.call(this) || this;
        _this.tokens = tokens;
        return _this;
    }
    CollectionToken.prototype.reduce = function (state) {
        var tokensState = query_1.createState(this.tokens, state.parameters.length);
        (_a = state.parameters).push.apply(_a, tokensState.parameters);
        (_b = state.text).push.apply(_b, tokensState.text);
        return state;
        var _a, _b;
    };
    return CollectionToken;
}(token_1.Token));
exports.CollectionToken = CollectionToken;
//# sourceMappingURL=collection-token.js.map