"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qs_1 = __importDefault(require("qs"));
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => ({
    search: async (ctx) => {
        var _a;
        try {
            const esInterface = strapi.plugins[app_config_1.default.app_name].services.esInterface;
            if (ctx.query.query) {
                const query = qs_1.default.parse(ctx.query.query);
                const resp = await esInterface.ES_searchData(query);
                if ((_a = resp === null || resp === void 0 ? void 0 : resp.hits) === null || _a === void 0 ? void 0 : _a.hits) {
                    const filteredData = resp.hits.hits.filter(dt => dt._source !== null);
                    const filteredMatches = filteredData.map((dt) => dt['_source']);
                    ctx.body = filteredMatches;
                }
                else {
                    ctx.body = {};
                }
            }
            else {
                ctx.body = {};
            }
        }
        catch (error) {
            console.error('An error has encountered while processing the search request.', error);
            ctx.throw(500, error);
        }
    }
});
