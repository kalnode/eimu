"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/indexing-logs',
            handler: 'logs.fetchRecentRunsLog',
            config: { policies: [] }
        }
    ]
};
