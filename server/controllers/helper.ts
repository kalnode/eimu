import appConfig from '../../app.config'

export default ({ strapi }) => {

    const helperService = strapi.plugins[appConfig.app_name].services.helper
    
    const orphansFind = async (ctx) => {
        try {
            return await helperService.orphansFind()
        } catch (error) {
            ctx.throw(500, error)
        } 
    }

    const orphansDelete = async (ctx) => {
        try {
            return await helperService.orphansDelete()
        } catch (error) {
            ctx.throw(500, error)
        } 
    }

    const getStrapiTypesForPlugin = async (ctx) => {
        try {
            return await helperService.getStrapiTypesForPlugin()
        } catch (error) {
            ctx.throw(500, error)
        }
    }
    
    return {
        orphansFind,
        orphansDelete,
        getStrapiTypesForPlugin
    }
}