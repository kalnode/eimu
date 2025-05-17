"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => {
    const logsService = strapi.plugins[app_config_1.default.app_name].services.logs;
    const fetchRecentRunsLog = async (ctx) => {
        try {
            return await logsService.getLogs();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    return {
        fetchRecentRunsLog
    };
};
