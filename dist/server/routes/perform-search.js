"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
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
};
