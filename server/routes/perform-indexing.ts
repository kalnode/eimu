export default {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/content-type-reindex/:contentTypeUid',
            handler: 'performIndexing.indexContentType',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/process-pending-tasks',
            handler: 'performIndexing.processPendingTasks',
            config: { policies: [] }
        }
    ]
}