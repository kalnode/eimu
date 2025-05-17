import appConfig from "../../app.config"

export default ({ strapi }) => ({

    async logIndexingPass(message) {
        const entry = await strapi.entityService.create('plugin::'+appConfig.app_name+'.indexing-log', {
            data: {
                status: 'pass',
                details: message
            }
        })
    },

    async logIndexingFail(message) {
        const entry = await strapi.entityService.create('plugin::'+appConfig.app_name+'.indexing-log', {
            data: {
                status: 'fail',
                details: String(message)
            }
        })
    },

    async getLogs(count = 50) {
        const records = await strapi.entityService.findMany('plugin::'+appConfig.app_name+'.indexing-log', {
            sort: { createdAt: 'DESC' },
            start: 0,
            limit: count
        })
        return records
    }
})