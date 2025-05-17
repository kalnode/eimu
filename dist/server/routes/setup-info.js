"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/setup-info',
            handler: 'setupInfo.getElasticsearchInfo',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/toggle-instant-indexing',
            handler: 'setupInfo.setPluginConfig',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/instant-indexing',
            handler: 'setupInfo.getPluginConfig',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/toggle-indexing-enabled',
            handler: 'setupInfo.toggleIndexingEnabled',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/toggle-usenewpluginparadigm-enabled',
            handler: 'setupInfo.toggleUseNewPluginParadigm',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/indexing-enabled',
            handler: 'setupInfo.getIndexingEnabled',
            config: { policies: [] }
        }
    ]
};
