import appConfig from '../../app.config'

export default ({ strapi }) => {

    const logsService = strapi.plugins[appConfig.app_name].services.logs

    const fetchRecentRunsLog = async (ctx) => {
        try {
            return await logsService.getLogs()
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    return {
        fetchRecentRunsLog
    }
}
