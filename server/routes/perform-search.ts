export default {
    type: 'content-api',
    routes: [
        {
            method: 'GET',
            path: '/search',
            handler: 'performSearch.search',
            config: { 
                policies: []
            }
        }
    ]
}