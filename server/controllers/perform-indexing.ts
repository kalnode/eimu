import appConfig from '../../app.config'

export default ({ strapi }) => {

    const performIndexing = strapi.plugins[appConfig.app_name].services.performIndexing
    const tasksService = strapi.plugins[appConfig.app_name].services.tasks

    const processPendingTasks = async (ctx) => {
        try {
            return await performIndexing.processPendingTasks()
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const indexContentType = async (ctx) => {
        try {
            return await tasksService.addContentTypeToIndex({contentTypeUid: ctx.params.contentTypeUid})
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const indexAllRecords = async (ctx) => {
        try {
            return await performIndexing.indexAllRecords(ctx.params.indexUUID)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    return {
        processPendingTasks,
        indexContentType,
        indexAllRecords
    }
}