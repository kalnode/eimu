"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => {
    const performIndexing = strapi.plugins[app_config_1.default.app_name].services.performIndexing;
    const tasksService = strapi.plugins[app_config_1.default.app_name].services.tasks;
    const processPendingTasks = async (ctx) => {
        try {
            return await performIndexing.processPendingTasks();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const indexContentType = async (ctx) => {
        try {
            return await tasksService.addContentTypeToIndex({ contentTypeUid: ctx.params.contentTypeUid });
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const indexAllRecords = async (ctx) => {
        try {
            return await performIndexing.indexAllRecords(ctx.params.indexUUID);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    return {
        processPendingTasks,
        indexContentType,
        indexAllRecords
    };
};
