"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => {
    const helperService = strapi.plugins[app_config_1.default.app_name].services.helper;
    const orphansFind = async (ctx) => {
        try {
            return await helperService.orphansFind();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const orphansDelete = async (ctx) => {
        try {
            return await helperService.orphansDelete();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const getStrapiTypesForPlugin = async (ctx) => {
        try {
            return await helperService.getStrapiTypesForPlugin();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    return {
        orphansFind,
        orphansDelete,
        getStrapiTypesForPlugin
    };
};
