"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/collection-config/:collectionname',
            handler: 'configureIndexing.getCollectionConfig',
            config: { policies: [] }
        },
        {
            method: 'POST',
            path: '/collection-config/:collectionname',
            handler: 'configureIndexing.saveCollectionConfig',
            config: { policies: [] }
        }
    ]
};
