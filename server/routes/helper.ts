export default {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/orphans-find',
            handler: 'helper.orphansFind',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/orphans-delete',
            handler: 'helper.orphansDelete',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/get-content-types',
            handler: 'helper.getStrapiTypesForPlugin',
            config: { policies: [] }
        }
    ]    
}