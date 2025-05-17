import appConfig from '../../app.config'

export default ({ strapi }) => {
    
    const esInterface = strapi.plugins[appConfig.app_name].services.esInterface

    const getESIndexes = async (ctx) => {
        try {
           return await esInterface.ES_getIndexes()
       } catch (error) {
           ctx.throw(500, error)
       }
    }

    const deleteIndex = async (ctx) => {
        try {
            return await esInterface.ES_deleteIndex(ctx.params.indexName)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const cloneIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            return await esInterface.ES_cloneIndex(body.data.indexName, body.data.targetName)
        } catch (error) {
            ctx.throw(500, error)
        }
    }
    
    const reindexIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            return await esInterface.ES_reindexIndex(body.data.indexName, body.data.targetName)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    return {
        getESIndexes,
        deleteIndex,
        cloneIndex,
        reindexIndex
    }
}