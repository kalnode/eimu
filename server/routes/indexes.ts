export default {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/get-index/:indexUUID',
            handler: 'indexes.getIndex',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/get-indexes',
            handler: 'indexes.getIndexes',
            config: { policies: [] }
        },
        {
            method: 'POST',
            path: '/create-index',
            handler: 'indexes.createIndex',
            config: { policies: [] }
        },
        {
            method: 'POST',
            path: '/delete-index',
            handler: 'indexes.deleteIndex',
            config: { policies: [] },
        },
        {
            method: 'POST',
            path: '/update-index/:indexUUID',
            handler: 'indexes.updateIndex',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/create-es-index/:indexUUID',
            handler: 'indexes.createESindex',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/index-records/:indexUUID',
            handler: 'performIndexing.indexAllRecords',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/get-es-mapping/:indexUUID',
            handler: 'indexes.getESMapping',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/sync-index/:indexUUID',
            handler: 'indexes.syncIndexWithExternal',
            config: { policies: [] }
        },
    ]    
}