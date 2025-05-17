import appConfig from '../../app.config'

export default ({ strapi }) => {
    
    const mappings = strapi.plugins[appConfig.app_name].services.mappings

    const getMapping = async (ctx) => {
        try {
            return await mappings.getStoreMapping(ctx.params.mappingUUID)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const getMappings = async (ctx) => {
        try {
            return await mappings.getStoreMappings(ctx.params.indexUUID)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const createMapping = async (ctx) => {
        const { body } = ctx.request
        try {
            return await mappings.createMapping(body.data)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const updateMapping = async (ctx) => {
        const { body } = ctx.request
        try {
            return await mappings.updateMapping(body.data)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const updateMappings = async (ctx) => {
        const { body } = ctx.request
        try {
            return await mappings.updateMappings(body.data)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const detachMapping = async (ctx) => {
        const { body } = ctx.request
        try {
            return await mappings.detachMapping(body.data.indexUUID, body.data.mappingUUID)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const deleteMapping = async (ctx) => {
        try {
            return await mappings.deleteMapping(ctx.params.mappingUUID)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    return {
        getMapping,
        getMappings,
        createMapping,
        updateMapping,
        updateMappings,
        deleteMapping,
        detachMapping
    }
}