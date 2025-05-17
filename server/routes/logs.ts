export default {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/indexing-logs',
            handler: 'logs.fetchRecentRunsLog',
            config: { policies: [] }
        }
    ]
}