export default {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/es-info',
            handler: 'general.getElasticsearchInfo',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/plugin-settings',
            handler: 'general.pluginSettings',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/toggle-instant-indexing',
            handler: 'general.setPluginConfig',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/instant-indexing',
            handler: 'general.getPluginConfig',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/toggle-indexing-enabled',
            handler: 'general.toggleIndexingEnabled',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/indexing-enabled',
            handler: 'general.getIndexingEnabled',
            config: { policies: [] }
        }
    ]    
}