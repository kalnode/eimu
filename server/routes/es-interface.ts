export default {
    type: 'admin',
    routes: [
        // {
        //     method: 'GET',
        //     path: '/create-es-index/:indexUUID',
        //     handler: 'indexes.createESindex',
        //     config: { policies: [] }
        // },
        {
            method: 'GET',
            path: '/get-es-indexes',
            handler: 'esInterface.getESIndexes',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/delete-es-index/:indexName',
            handler: 'esInterface.deleteIndex',
            config: { policies: [] }
        },
        {
            method: 'POST',
            path: '/clone-es-index',
            handler: 'esInterface.cloneIndex',
            config: { policies: [] }
        },
        {
            method: 'POST',
            path: '/rebuild-es-index',
            handler: 'esInterface.reindexIndex',
            config: { policies: [] }
        },
        // {
        //     method: 'GET',
        //     path: '/get-es-mapping/:indexUUID',
        //     handler: 'indexes.getESMapping',
        //     config: { policies: [] }
        // }
    ]    
}