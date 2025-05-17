"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    "kind": "collectionType",
    "collectionName": "es-mappings",
    "info": {
        "singularName": "mapping",
        "pluralName": "mappings",
        "displayName": "ES Mappings",
        "description": "ES mappings for post types"
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
        "post_type": {
            "type": "string",
            "required": true
        },
        "mapping": {
            "type": "richtext"
        },
        "preset": {
            "type": "boolean",
        },
        "nested_level": {
            "type": "integer"
        },
        "indexes": {
            "type": "relation",
            "relation": "manyToMany",
            "target": "plugin::esplugin.registered-index",
            "mappedBy": "mappings" // TODO: Or should this be inversedBy?
        },
        "default_preset": {
            "type": "boolean"
        }
    }
};
