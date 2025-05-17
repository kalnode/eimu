import pluginId from "../pluginId"

// GENERAL
export const apiGetSystemInfo = `/${pluginId}/es-info`

// SETTINGS
export const apiGetPluginSettings = `/${pluginId}/plugin-settings`
export const apiInstantIndexing = `/${pluginId}/instant-indexing`
export const apiToggleInstantIndexing = `/${pluginId}/toggle-instant-indexing`
export const apiIndexingEnabled = `/${pluginId}/indexing-enabled`
export const apiToggleIndexingEnabled = `/${pluginId}/toggle-indexing-enabled`

// EXPORT/IMPORT
// export const apiExport = `/${pluginId}/export`
// export const apiImport = `/${pluginId}/import`

// ORPHANS
export const apiOrphansFind = `/${pluginId}/orphans-find`
export const apiOrphansDelete = `/${pluginId}/orphans-delete`

// INDEXES
export const apiGetIndexes = `/${pluginId}/get-indexes`
export const apiGetESIndexes = `/${pluginId}/get-es-indexes`
export const apiGetIndex = (indexUUID:string) => `/${pluginId}/get-index/${indexUUID}`
export const apiCreateIndex = `/${pluginId}/create-index`
export const apiDeleteIndex = `/${pluginId}/delete-index`
export const apiUpdateIndex = (indexUUID:string) => `/${pluginId}/update-index/${indexUUID}`
export const apiIndexRecords = (indexUUID:string) => `/${pluginId}/index-records/${indexUUID}`

// ES
export const apiCreateESindex = (indexUUID:string) => `/${pluginId}/create-es-index/${indexUUID}`
export const apiDeleteESIndex = (indexName:string) => `/${pluginId}/delete-es-index/${indexName}`
export const apiCloneESIndex = `/${pluginId}/clone-es-index`
export const apiRebuildESIndex = `/${pluginId}/rebuild-es-index`
export const apiSyncIndex = (indexUUID:string) => `/${pluginId}/sync-index/${indexUUID}`

// MAPPING
export const apiGetMapping = (mappingUUID:string) => `/${pluginId}/get-mapping/${mappingUUID}`
export const apiGetMappings = (indexUUID?:string) => indexUUID ? `/${pluginId}/get-mappings/${indexUUID}` : `/${pluginId}/get-mappings`
export const apiCreateMapping = `/${pluginId}/create-mapping`
export const apiUpdateMapping = (mappingUUID:string) => `/${pluginId}/update-mapping/${mappingUUID}`
export const apiUpdateMappings = `/${pluginId}/update-mappings/`
export const apiDeleteMapping = (mappingUUID:string) => `/${pluginId}/delete-mapping/${mappingUUID}`
export const apiDetachMappingFromIndex = `/${pluginId}/detach-mapping`
export const apiGetESMapping = (indexUUID:string) => `/${pluginId}/get-es-mapping/${indexUUID}`
export const apiGetContentTypes = `/${pluginId}/get-content-types`

// INDEXING
//export const apiRequestContentTypeIndexing = (contentType:string) => `/${pluginId}/content-type-reindex/${contentType}`
export const apiProcessPendingTasks = `/${pluginId}/process-pending-tasks`

// LOGS
export const apiGetLogs = `/${pluginId}/indexing-logs`