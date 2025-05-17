"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ strapi }) => {
    const helperService = strapi.plugins['eimu'].services.helper;
    const getElasticsearchInfo = async (ctx) => {
        try {
            return await helperService.getElasticsearchInfo();
        }
        catch (error) {
            console.error("setup-info getElasticsearchInfo error", error);
            ctx.throw(500, error);
        }
    };
    const setPluginConfig = async (ctx) => {
        try {
            const updatedConfig = await helperService.storeToggleSettingInstantIndex();
            return updatedConfig;
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const getPluginConfig = async (ctx) => {
        try {
            const pluginConfig = await helperService.storeSettingInstantIndex();
            return pluginConfig;
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const toggleIndexingEnabled = async (ctx) => {
        const { body } = ctx.request;
        try {
            const updatedConfig = await helperService.storeSettingToggleInstantIndexing(); //({config: body})
            return updatedConfig;
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const toggleUseNewPluginParadigm = async (ctx) => {
        try {
            return await helperService.storeSettingToggleUseNewPluginParadigm();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const getIndexingEnabled = async (ctx) => {
        try {
            const pluginConfig = await helperService.storeSettingIndexingEnabled();
            return pluginConfig;
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
        toggleUseNewPluginParadigm
    };
};
