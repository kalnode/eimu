export default {
    "kind": "collectionType",
    "collectionName": "es-indexing-logs",
    "info": {
        "singularName": "indexing-log",
        "pluralName": "indexing-logs",
        "displayName": "ES Indexing Logs",
        "description": "Logged runs of indexing jobs"
    },
    "options": {
        "draftAndPublish": false
    },
    "pluginOptions": {
        'content-manager': {
            visible: true
        },
        'content-type-builder': {
            visible: false
        }
    },
    "attributes": {
        "status": {
            "type": "enumeration",
            "enum": [
                "pass",
                "fail"
            ],
            "required": true
        },
        "details": {
            "type": "text"
        }  
    }
}
  