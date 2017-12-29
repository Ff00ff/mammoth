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
var columns_1 = require("../../columns");
var database_1 = require("../../database");
var table_1 = require("../../table");
var table_2 = require("../table");
describe('generateCreateTableSql', function () {
    it('should generate a simple table', function () {
        var Organization = /** @class */ (function (_super) {
            __extends(Organization, _super);
            function Organization() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.id = new columns_1.UuidColumn().primary().notNull().default("uuid_generate_v4()");
                _this.apiKey = new columns_1.TextColumn().notNull().unique();
                return _this;
            }
            return Organization;
        }(table_1.Table));
        var db = database_1.createDatabase({
            organization: new Organization(),
        });
        var sql = table_2.generateCreateTableSql(db.organization);
        expect(sql).toMatchSnapshot();
    });
});
//# sourceMappingURL=table.test.js.map