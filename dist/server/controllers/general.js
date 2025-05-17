"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => {
    const pluginState = strapi.plugins[app_config_1.default.app_name].services.general;
    const getElasticsearchInfo = async (ctx) => {
        try {
            return await pluginState.getElasticsearchInfo();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const pluginSettings = async (ctx) => {
        try {
            return await pluginState.getPluginSettings();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const setPluginConfig = async (ctx) => {
        try {
            return await pluginState.storeToggleSettingInstantIndex();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const getPluginConfig = async (ctx) => {
        try {
            return await pluginState.storeSettingInstantIndex();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const toggleIndexingEnabled = async (ctx) => {
        try {
            return await pluginState.storeSettingToggleInstantIndexing();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const getIndexingEnabled = async (ctx) => {
        try {
            return await pluginState.storeSettingIndexingEnabled();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    return {
        getElasticsearchInfo,
        setPluginConfig,
        getPluginConfig,
        toggleIndexingEnabled,
        getIndexingEnabled,
        pluginSettings
    };
};
