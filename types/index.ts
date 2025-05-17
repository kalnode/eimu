
// TODO: Keep these for now; development
// import type { Attribute } from "@strapi/strapi"
// import ContentType from "@strapi/strapi"
// import type { ContentType } from "@strapi/types/dist/types/shared/registries/"
// import type { ContentType } from "@strapi/types/dist/types/core/uid"

export type Mapping = {
    uuid?: string
    content_type: string
    disabled?: boolean
    fields?: MappingField
    preset?: boolean
    default_preset?: boolean
    nested_level?: number // TODO: early dev work; unknown if we keep this
    indexes?: Array<string> // TODO: put index type here
}

export interface MappingField {
    [key: string]: {
        active?: boolean
        type?: string // TODO: Perhaps change this to "dataType" to better match the language of ES and minimize any possible conflation that this has any relation to typescript
        index?: boolean // ES-side attribute, whether to index the field (in the context of ES)
        externalName?: string // Apply a different field name ES-side
        preset_uuid?: string
        mapping?: Mapping
    }
}

export interface StrapiTypesForPlugin {
    [key: string]: StrapiFieldType
    // Example:
    // "api::event.event": {
    //     Title: {
    //         //...
    //     }
    // }
}

export interface StrapiFieldType {
    [key: string]: {
        strapi_type: string
        raw_type: string
        field_type: string // e.g. "regular"
        whole_raw_object: any
    }
}

export const mappingTypes = {
    false: 'false',
    true: 'true',
    runtime: 'runtime',
    strict: 'strict'
} as const

export type RegisteredIndex = {
    uuid: string 
    index_name: string
    index_alias?: string
    active?: boolean
    mappings?: Array<string> // Array of uuid's for mappings
    mapping_type?: typeof mappingTypes // TODO: Make this an enum: 'false', 'dynamic', 'runtime', etc
    scheduledIndexing?: boolean // If enabled, indexing events are handle during cron cycle. If disabled, records are instantly indexed.
}