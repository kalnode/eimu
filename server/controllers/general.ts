import appConfig from '../../app.config'
export default ({ strapi }) => {

    const pluginState = strapi.plugins[appConfig.app_name].services.general

    const getElasticsearchInfo = async (ctx) => {
        try {
            return await pluginState.getElasticsearchInfo()
        } catch (error) {
            ctx.throw(500, error)
        }    
    }

    const pluginSettings = async (ctx) => {
        try {
            return await pluginState.getPluginSettings()
        } catch (error) {
            ctx.throw(500, error)
        } 
    }

    const setPluginConfig = async (ctx) => {
        try {
            return await pluginState.storeToggleSettingInstantIndex()
        } catch (error) {
            ctx.throw(500, error)
        }    
    }
    
    const getPluginConfig = async (ctx) => {
        try {
            return await pluginState.storeSettingInstantIndex()
        } catch (error) {
            ctx.throw(500, error)
        } 
    }

    const toggleIndexingEnabled = async (ctx) => {
        try {
            return await pluginState.storeSettingToggleInstantIndexing()
        } catch (error) {
            ctx.throw(500, error)
        }    
    }
   
    const getIndexingEnabled = async (ctx) => {
        try {
            return await pluginState.storeSettingIndexingEnabled()
        } catch (error) {
            ctx.throw(500, error)
        } 
    }

    return {
        getElasticsearchInfo,
        setPluginConfig,
        getPluginConfig,
        toggleIndexingEnabled,
        getIndexingEnabled,
        pluginSettings
    }
}