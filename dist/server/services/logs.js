"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => ({
    async logIndexingPass(message) {
        const entry = await strapi.entityService.create('plugin::' + app_config_1.default.app_name + '.indexing-log', {
            data: {
                status: 'pass',
                details: message
            }
        });
    },
    async logIndexingFail(message) {
        const entry = await strapi.entityService.create('plugin::' + app_config_1.default.app_name + '.indexing-log', {
            data: {
                status: 'fail',
                details: String(message)
            }
        });
    },
    async getLogs(count = 50) {
        const records = await strapi.entityService.findMany('plugin::' + app_config_1.default.app_name + '.indexing-log', {
            sort: { createdAt: 'DESC' },
            start: 0,
            limit: count
        });
        return records;
    }
});
