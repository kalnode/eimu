import appConfig from "../../app.config"

export default ({ strapi }) => ({
 
    isInitialized() {
        return strapi[appConfig.app_name+'_pluginCache']?.initialized || false
    },

    async initializePlugin() {

        try {

            if (!strapi[appConfig.app_name+'_pluginCache']) {
                strapi[appConfig.app_name+'_pluginCache'] = {}
            }

            const pluginStore = strapi.plugins[appConfig.app_name].services.helper.getPluginStore()
            const pluginInstanceCached = strapi[appConfig.app_name+'_pluginCache']

            const mappingsService = await strapi.plugins[appConfig.app_name].services.mappings
            pluginInstanceCached.mappings = await mappingsService.getStoreMappings()
    
            const indexingService = await strapi.plugins[appConfig.app_name].services.indexes
            pluginInstanceCached.indexes = await indexingService.getStoreIndexes()

            const settings = await pluginStore.get({ key: 'pluginsettings' })
            if (!settings) {   
                this.setDefaultSettings()
            }
            pluginInstanceCached.settings = settings
            pluginInstanceCached.initialized = true

        } catch (error) {
            console.log("Error initializing plugin", error)
        }
       
    },

    async setDefaultSettings() {
        const newSettings = {
            settingIndexingEnabled: true,
            settingInstantIndex: true
        }
        const pluginStore = strapi.plugins[appConfig.app_name].services.helper.getPluginStore()
        await pluginStore.set({ key: 'pluginsettings', value: newSettings})
    },

    async getElasticsearchInfo() {
        const pluginState = strapi.plugins[appConfig.app_name].services.general
        const esInterface = strapi.plugins[appConfig.app_name].services.esInterface
        const pluginConfig = await strapi.config.get('plugin.'+appConfig.app_name)
        const connected = pluginConfig.connection && pluginConfig.connection.host ? await esInterface.ES_checkConnection() : false

        return {
            cronSchedule: pluginConfig.cronSchedule || "Not configured",
            elasticHost: pluginConfig.connection && pluginConfig.connection.host ? pluginConfig.connection.host : "Not configured",
            elasticUserName: pluginConfig.connection && pluginConfig.connection.username ? pluginConfig.connection.username : "Not configured",
            elasticCertificate: pluginConfig.connection && pluginConfig.connection.certificate ? pluginConfig.connection.certificate : "Not configured",
            elasticIndexAlias: pluginConfig.indexAliasName || "Not configured",
            connected: connected || "Not connected",
            initialized: pluginState.isInitialized() || "Not initialized"
        }
    },

    async getPluginSettings():Promise<object> {
        try {
            const pluginInstance = strapi[appConfig.app_name+'_pluginCache']
            return pluginInstance.settings
        } catch(error) {
            console.error('SERVICE helper getESMapping - error:', error)
            throw error
        }   
    },

    async storeToggleSettingInstantIndex():Promise<boolean> {
        try {
            const pluginInstance = strapi[appConfig.app_name+'_pluginCache']
            const pluginStore = strapi.plugins[appConfig.app_name].services.helper.getPluginStore()
            if (pluginInstance && pluginInstance.settings) {
                pluginInstance.settings['settingInstantIndex'] = !pluginInstance.settings['settingInstantIndex']
                await pluginStore.set({ key: 'pluginsettings', value: pluginInstance.settings})
                return pluginInstance.settings['settingInstantIndex']
            }    
            return false            
        } catch (error) {
            throw error
        }
    },

    async storeSettingInstantIndex():Promise<string> {
        try {
            const pluginInstance = strapi[appConfig.app_name+'_pluginCache']
            if (pluginInstance && pluginInstance.settings['settingInstantIndex'] != undefined) {
                return pluginInstance.settings['settingInstantIndex']
            }
            throw "Setting instant index not found"
        } catch (error) {
            throw error
        }
    },

    async storeSettingToggleInstantIndexing():Promise<boolean> {
        try {
            const pluginInstance = strapi[appConfig.app_name+'_pluginCache']
            const pluginStore = strapi.plugins[appConfig.app_name].services.helper.getPluginStore()
            if (pluginInstance && pluginInstance.settings) {
                pluginInstance.settings['settingIndexingEnabled'] = !pluginInstance.settings['settingIndexingEnabled']
                await pluginStore.set({ key: 'pluginsettings', value: pluginInstance.settings})
                return pluginInstance.settings['settingIndexingEnabled']
            }            
            return false
        } catch (error) {
            throw error
        }
    },

    async storeSettingIndexingEnabled():Promise<boolean> {
        try {
            const pluginInstance = strapi[appConfig.app_name+'_pluginCache']
            return pluginInstance.settings['settingIndexingEnabled']
        } catch(error) {
            throw error
        }
    }

})
