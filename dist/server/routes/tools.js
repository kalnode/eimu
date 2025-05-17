"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/orphans-find',
            handler: 'tools.orphansFind',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/orphans-delete',
            handler: 'tools.orphansDelete',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/get-content-types',
            handler: 'tools.getStrapiContentTypes',
            config: { policies: [] }
        }
    ]
};
