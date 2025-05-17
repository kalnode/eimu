"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => ({
    isInitialized() {
        var _a;
        return ((_a = strapi[app_config_1.default.app_name + '_pluginCache']) === null || _a === void 0 ? void 0 : _a.initialized) || false;
    },
    async initializePlugin() {
        try {
            if (!strapi[app_config_1.default.app_name + '_pluginCache']) {
                strapi[app_config_1.default.app_name + '_pluginCache'] = {};
            }
            const pluginStore = strapi.plugins[app_config_1.default.app_name].services.helper.getPluginStore();
            const pluginInstanceCached = strapi[app_config_1.default.app_name + '_pluginCache'];
            const mappingsService = await strapi.plugins[app_config_1.default.app_name].services.mappings;
            pluginInstanceCached.mappings = await mappingsService.getStoreMappings();
            const indexingService = await strapi.plugins[app_config_1.default.app_name].services.indexes;
            pluginInstanceCached.indexes = await indexingService.getStoreIndexes();
            const settings = await pluginStore.get({ key: 'pluginsettings' });
            if (!settings) {
                this.setDefaultSettings();
            }
            pluginInstanceCached.settings = settings;
            pluginInstanceCached.initialized = true;
        }
        catch (error) {
            console.log("Error initializing plugin", error);
        }
    },
    async setDefaultSettings() {
        const newSettings = {
            settingIndexingEnabled: true,
            settingInstantIndex: true
        };
        const pluginStore = strapi.plugins[app_config_1.default.app_name].services.helper.getPluginStore();
        await pluginStore.set({ key: 'pluginsettings', value: newSettings });
    },
    async getElasticsearchInfo() {
        const pluginState = strapi.plugins[app_config_1.default.app_name].services.general;
        const esInterface = strapi.plugins[app_config_1.default.app_name].services.esInterface;
        const pluginConfig = await strapi.config.get('plugin.' + app_config_1.default.app_name);
        const connected = pluginConfig.searchConnector && pluginConfig.searchConnector.host ? await esInterface.ES_checkConnection() : false;
        return {
            cronSchedule: pluginConfig.cronSchedule || "Not configured",
            elasticHost: pluginConfig.searchConnector && pluginConfig.searchConnector.host ? pluginConfig.searchConnector.host : "Not configured",
            elasticUserName: pluginConfig.searchConnector && pluginConfig.searchConnector.username ? pluginConfig.searchConnector.username : "Not configured",
            elasticCertificate: pluginConfig.searchConnector && pluginConfig.searchConnector.certificate ? pluginConfig.searchConnector.certificate : "Not configured",
            elasticIndexAlias: pluginConfig.indexAliasName || "Not configured",
            connected: connected || "Not connected",
            initialized: pluginState.isInitialized() || "Not initialized"
        };
    },
    async getPluginSettings() {
        try {
            const pluginInstance = strapi[app_config_1.default.app_name + '_pluginCache'];
            return pluginInstance.settings;
        }
        catch (error) {
            console.error('SERVICE helper getESMapping - error:', error);
            throw error;
        }
    },
    async storeToggleSettingInstantIndex() {
        try {
            const pluginInstance = strapi[app_config_1.default.app_name + '_pluginCache'];
            const pluginStore = strapi.plugins[app_config_1.default.app_name].services.helper.getPluginStore();
            if (pluginInstance && pluginInstance.settings) {
                pluginInstance.settings['settingInstantIndex'] = !pluginInstance.settings['settingInstantIndex'];
                await pluginStore.set({ key: 'pluginsettings', value: pluginInstance.settings });
                return pluginInstance.settings['settingInstantIndex'];
            }
            return false;
        }
        catch (error) {
            throw error;
        }
    },
    async storeSettingInstantIndex() {
        try {
            const pluginInstance = strapi[app_config_1.default.app_name + '_pluginCache'];
            if (pluginInstance && pluginInstance.settings['settingInstantIndex'] != undefined) {
                return pluginInstance.settings['settingInstantIndex'];
            }
            throw "Setting instant index not found";
        }
        catch (error) {
            throw error;
        }
    },
    async storeSettingToggleInstantIndexing() {
        try {
            const pluginInstance = strapi[app_config_1.default.app_name + '_pluginCache'];
            const pluginStore = strapi.plugins[app_config_1.default.app_name].services.helper.getPluginStore();
            if (pluginInstance && pluginInstance.settings) {
                pluginInstance.settings['settingIndexingEnabled'] = !pluginInstance.settings['settingIndexingEnabled'];
                await pluginStore.set({ key: 'pluginsettings', value: pluginInstance.settings });
                return pluginInstance.settings['settingIndexingEnabled'];
            }
            return false;
        }
        catch (error) {
            throw error;
        }
    },
    async storeSettingIndexingEnabled() {
        try {
            const pluginInstance = strapi[app_config_1.default.app_name + '_pluginCache'];
            return pluginInstance.settings['settingIndexingEnabled'];
        }
        catch (error) {
            throw error;
        }
    }
});
