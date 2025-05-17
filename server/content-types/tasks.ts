export default {
    "kind": "collectionType",
    "collectionName": "es-tasks",
    "info": {
        "singularName": "task",
        "pluralName": "tasks",
        "displayName": "ES Task",
        "description": "Search indexing tasks"
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
        "index_uuid": {
            "type": "string",
            "required": true
        },
        "content_type": {
            "type": "string",
            "required": true
        },
        "record_id": {
            "type": "integer",
            "required": true,
        },
        "indexing_status": {
            "type": "enumeration",
            "enum": [
                "to-be-done",
                "done"
            ],
            "required": true,
            "default": "to-be-done"
        },
        "indexing_type": {
            "type": "enumeration",
            "enum": [
                "add-to-index",
                "remove-from-index",
                "full_db_indexing"
            ],
            "default": "add-to-index",
            "required": true
        }
    }



    // "attributes": {
    //     "index_uuid": {
    //         "type": "string",
    //         "required": true
    //     },
    //     "content_type": {
    //         "type": "string",
    //         //"required": true
    //     },
    //     "record_id": {
    //         "type": "integer",
    //         //"required": true,
    //     },
    //     "indexing_status": {
    //         "type": "enumeration",
    //         "enum": [
    //             "to-be-done",
    //             "done"
    //         ],
    //         "required": true,
    //         "default": "to-be-done"
    //     },
    //     "indexing_type": {
    //         "type": "enumeration",
    //         "enum": [
    //             "add-to-index",
    //             "remove-from-index",
    //             "full_db_indexing"
    //         ],
    //         "default": "add-to-index",
    //         "required": true
    //     }
    // }



}
  