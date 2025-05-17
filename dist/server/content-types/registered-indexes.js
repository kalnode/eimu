"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    "kind": "collectionType",
    "collectionName": "es-registered-indexes",
    "info": {
        "singularName": "registered-index",
        "pluralName": "registered-indexes",
        "displayName": "ES Registered Index",
        "description": "Search registered indexes"
    },
    "options": {
        "draftAndPublish": false
    },
    "pluginOptions": {
        'content-manager': {
            visible: true
        },
        'content-type-builder': {
            visible: true
        }
    },
    "attributes": {
        "uuid": {
            "type": "string",
            "required": true
        },
        "index_name": {
            "type": "string",
            "required": true
        },
        "index_alias": {
            "type": "string"
        },
        "active": {
            "type": "boolean"
        },
        "mappings": {
            "type": "relation",
            "relation": "manyToMany",
            "target": "plugin::esplugin.mapping",
            "inversedBy": "indexes" // TODO: Or should this be mappedBy?
        }
    }
};
