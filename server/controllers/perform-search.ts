import qs from "qs"
import appConfig from '../../app.config'

export default ({ strapi }) => ({
    search: async (ctx) => {
        try {
            const esInterface = strapi.plugins[appConfig.app_name].services.esInterface
            if (ctx.query.query) {
                const query = qs.parse(ctx.query.query)
                const resp = await esInterface.ES_searchData(query)
                if (resp?.hits?.hits) {
                    const filteredData = resp.hits.hits.filter(dt => dt._source !== null)
                    const filteredMatches = filteredData.map((dt) => dt['_source'])
                    ctx.body = filteredMatches
                } else {
                    ctx.body = {}
                }
            } else {
                ctx.body = {}
            }
        } catch (error) {
            console.error('An error has encountered while processing the search request.', error)
            ctx.throw(500, error)
        }
    }
})
