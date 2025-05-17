import { estypes } from '@elastic/elasticsearch'
import { isEmpty, merge } from "lodash/fp"
import { markdownToTxt } from "markdown-to-txt"
import { Mapping, RegisteredIndex, StrapiTypesForPlugin } from "../../types"
import { populateMappingPresets } from "../../scripts"
import appConfig from '../../app.config'
import type { ContentType } from "@strapi/types/dist/types/core/uid"

export default ({ strapi }) => ({

    // =================================
    // ADD/UPDATE
    // =================================

    async processStrapiAddUpdateEvent(event: { model: any, result: any }) {
        // TODO: Type event:{} better.
        
        try {
            
            const pluginInstance = strapi[appConfig.app_name+'_pluginCache']
            const indexes = pluginInstance.indexes
            const mappings = pluginInstance.mappings
            const tasksService = strapi.plugins[appConfig.app_name].services.tasks

            const helper = strapi.plugins[appConfig.app_name].services.helper
            const strapiTypesForPlugin:StrapiTypesForPlugin = await helper.getStrapiTypesForPlugin()

            if (indexes && event.model && event.model.uid && event.model.uid != 'strapi::core-store') {

                indexes.forEach( async (index:RegisteredIndex) => {

                    // TODO: Add condition for "active" here, because a mapping for an index could be disabled.
                    const mappingsForIndex = mappings.filter( (x:Mapping) => x.uuid && index.mappings && index.mappings.includes(x.uuid))

                    const matchedMapping:Mapping = mappingsForIndex.find( (x:Mapping) => x.content_type === event.model.uid)

                    if (matchedMapping) {

                        // REMOVE
                        // Specifically for the case of models that have DRAFT-PUBLISH mode enabled,
                        // if the record has no "publishedAt" attribute we infer the record has been unpublished, and the ES record should be removed
                        if (event.model.attributes.publishedAt && !event.result.publishedAt) {

                            if (index.scheduledIndexing) {
                                const payload = {
                                    indexUUID: index.uuid,
                                    contentTypeUid: event.model.uid,
                                    recordId: event.result.id
                                }
                                await tasksService.removeItemFromIndex(payload)

                            } else {
                                deleteSingleRecord(index, matchedMapping.content_type, event.result.id)
                            }

                        // ADD/UPDATE
                        // All other cases
                        } else if ((event.model.attributes.publishedAt && event.result.publishedAt) || !event.model.attributes.publishedAt) {
                            if (index.scheduledIndexing) {

                                // NOTE: A Strapi record pull will occur when this task eventually gets processed
                                tasksService.addOrUpdateItemToIndex(index.uuid, matchedMapping.content_type, event.result.id)

                            } else {

                                let finalResult = event.result

                                // NOTE: We make a Strapi record pull here if result doesn't come with data.
                                // Why: If the event is part of a Strapi batch lifecycle event (e.g. "afterCreateMany"), result data is not passed.
                                if (finalResult.has_no_data) {
                                    const work = await strapi.entityService.findOne(event.model.uid, event.result.id)
                                    if (work) {
                                        finalResult = { ...finalResult, ...work }
                                        finalResult.has_no_data = undefined // No longer needed
                                    } else {
                                        // TODO: Check what happens with this throw; does it disrupt the parent loop?
                                        throw "Strapi record not found"
                                    }
                                }

                                processSingleAddUpdateRecord(index, matchedMapping, strapiTypesForPlugin, finalResult)
                            }
                        }


                    }
                })
            }
        } catch (error) {
            throw error
        }
       
    },


    // =================================
    // DELETION
    // =================================

    async processStrapiDeleteEvent(event: { model: any, result: any }) {
        // TODO: Type event:{} better.

        const pluginInstance = strapi[appConfig.app_name+'_pluginCache']
        const indexes = pluginInstance.indexes
        const tasksService = strapi.plugins[appConfig.app_name].services.tasks

        if (indexes && event.model && event.model.uid && event.model.uid != 'strapi::core-store') {

            indexes.forEach( async (index:RegisteredIndex) => {
                
                if (index.scheduledIndexing) {

                    const payload = {
                        indexUUID: index.uuid,
                        contentTypeUid: event.model.uid,
                        recordId: event.result.id
                    }
                    await tasksService.removeItemFromIndex(payload)

                } else {

                    deleteSingleRecord(index, event.model.uid, event.result.id)
                
                }            
                
            })
        }
    },


    // =================================
    // PENDING TASKS
    // =================================
    async processPendingTasks() {

        try {

            const tasksService = strapi.plugins[appConfig.app_name].services.tasks
            const logsService = strapi.plugins[appConfig.app_name].services.logs
            const helper = strapi.plugins[appConfig.app_name].services.helper
            const strapiTypesForPlugin:StrapiTypesForPlugin = await helper.getStrapiTypesForPlugin()

            // TODO: Add typing to this, e.g. Array<ESTasks> or something
            const pendingTasks = await tasksService.getItemsPendingToBeIndexed()

            if (pendingTasks && pendingTasks.length > 0) {

                // TODO: Will this ever be multiple entries?
                const fullSiteIndexing = pendingTasks.filter(r => r.indexing_type === 'full_db_indexing').length > 0

                if (fullSiteIndexing) {

                    console.log("processPendingTasks 333")
                    // TODO: prob we want this: indexAllRecords()

                    // TODO: What is this for?
                    // for (let r = 0; r < pendingTasks.length; r++) {
                    //     await tasksService.markIndexingTaskComplete(pendingTasks[r].id)
                    // }

                } else {

                    try {

                        for (let r = 0; r < pendingTasks.length; r++) {

                            const task = pendingTasks[r]

                            // SINGLE RECORD TASK
                            if (task.record_id) {

                                const pluginInstance = strapi[appConfig.app_name+'_pluginCache']
                                const indexes = pluginInstance.indexes
                                const index = indexes.find( (x:RegisteredIndex) => x.uuid === task.index_uuid)
                                const mappingForRecordContentType = index.mappings.find( (x:Mapping) => x.content_type === task.content_type)

                                if (mappingForRecordContentType) {

                                    if (task.indexing_type === 'add-to-index') {
                                        const record = await strapi.entityService.findOne(task.content_type, task.record_id)

                                        if (record) {
                                            await processSingleAddUpdateRecord(index, mappingForRecordContentType, strapiTypesForPlugin, record)
                                        }

                                    } else if (task.indexing_type === 'remove-from-index') {
                                        await deleteSingleRecord(index, mappingForRecordContentType, task.record_id)
                                    }
                                }

                            }
                            
                            // else {

                            //     // TODO: Scrutinize this
                            //     // PENDING: Index an entire content type
                            //     //await this.indexContentType(task.content_type)
                            //     //await tasksService.markIndexingTaskComplete(task.id)
                            // }

                            //await tasksService.markIndexingTaskComplete(task.id)

                        }

                        logsService.logIndexingPass('Indexing of ' + String(pendingTasks.length) + ' records complete.')

                    } catch(error) {
                        logsService.logIndexingFail('Indexing of records failed - ' + ' ' + String(error))
                        console.error(error)
                        throw error
                    }
                }
            }

            return "Pending work tasks underway"
        
        } catch(error) {
            console.error('SERVICE - PERFORM INDEXING - processPendingTasks error:', error)
            throw error
        }
    },




    // =================================
    // INDEX ALL
    // =================================
    async indexAllRecords(indexUUID) {

        const helper = strapi.plugins[appConfig.app_name].services.helper       
        const pluginInstance = strapi[appConfig.app_name+'_pluginCache']
        const indexes = pluginInstance.indexes
        const mappings = pluginInstance.mappings
        const index = indexes.find( (x:Mapping) => x.uuid === indexUUID)
        const strapiTypesForPlugin:StrapiTypesForPlugin = await helper.getStrapiTypesForPlugin()

        if (index && index.mappings) {

            for (let i = 0; i < index.mappings.length; i++) {

                const mapping = mappings.find( (x:Mapping) => x.uuid === index.mappings[i])

                if (mapping) {

                    // TODO: getFullPopulateObject() is a legacy func, however, do we need it? Are we doing the same within helper.getStrapiTypesForPlugin() ?
                    const populateAttrib = await getFullPopulateObject(mapping.content_type, 4, [])

                    const isTypeDraftPublish = strapiTypesForPlugin[mapping.content_type].publishedAt

                    const preparedFilters = isTypeDraftPublish ? {
                        publishedAt: {
                            $notNull: true
                        }
                    } : undefined

                    await strapi.entityService.findMany(mapping.content_type, {
                        sort: { createdAt: 'DESC' },
                        filters: preparedFilters,
                        populate: populateAttrib && populateAttrib['populate'] ? populateAttrib['populate'] : undefined,
                    })
                    .then( (response) => {
                        for (let k = 0; k < response.length; k++) {
                            this.processStrapiAddUpdateEvent({model: { uid: mapping.content_type, attributes: strapi.getModel(mapping.content_type) }, result: response[k]})
                        }
                    })

                }
            }
        }

        return true
    },


})


// ==================================
// INTERNAL FUNCTIONS
// ==================================

const processSingleAddUpdateRecord = async (index:RegisteredIndex, mapping:Mapping, strapiTypesForPlugin:StrapiTypesForPlugin, result:any) => {

        
    // TODO: In theory, this must be non-blocking (ie no "await")
    // Re-affirm this, and perhaps put a permanent note here for future dev's.
    addUpdateSingleRecord(index, mapping, result)


    // =======================================
    // PROCESS RELATIONS
    // =======================================

    // We go through all Strapi types and their fields and look for relationships.
    // If match found, we recursively process any records of that type as well.

    // TODO: This entire thing should be wrapped in a feature flag. Possible some end-users do not want relations to be indexed (who knows why).

    // TODO: We have no limit to recursion! This is important. Maybe it should be set to "3" as default? Shall it be configurable?

    // LOOP - Strapi types
    for (const [keyType, valueType] of Object.entries(strapiTypesForPlugin)) {

        // LOOP - Fields within type
        for (const [keyField, valueField] of Object.entries(valueType as unknown as any)) {

            // LOOP - Attributes within field
            for (const [keyField2, valueField2] of Object.entries(valueField as unknown as any)) {

                // TODO: This is a plugin proprietary property; we use it to hold the original Strapi type.
                // It works for now until there's a more elegant way.
                if (keyField2 === 'whole_raw_object') {

                    let targetType = (valueField2 as unknown as any)['target']

                    // RELATION EXISTS
                    // The original lifecycle record type matches a relation in another content type,
                    // so we pull relevant records so they can be updated in ES too.
                    if (targetType === mapping.content_type) {

                        // PULL RELATION RECORDS
                        // We only populate the relational field.
                        // We filter by type.

                        // TODO: remove this ts-ignore and type this correctly
                        // @ts-ignore
                        const records = await strapi.entityService.findMany(keyType, {
                            start: 0,
                            populate: [keyField],
                            filters: {
                                $or: [
                                    { [keyField]: { id: result.id }}
                                ]		
                            }
                        })

                        // TODO: Type this
                        // TODO: Create processStrapiRecord that handles multiple strapi records...?? processStrapiRecords
                        if (records) {
                            records.forEach( (x:any) => {
                                processSingleAddUpdateRecord(index, mapping, strapiTypesForPlugin, x)
                            })
                        }

                    }
                }
            }
        }
    }

}


const addUpdateSingleRecord = async (index:RegisteredIndex, mapping:Mapping, result:any) => {

    try {
        const esInterface = strapi.plugins[appConfig.app_name].services.esInterface
        const logsService = strapi.plugins[appConfig.app_name].services.logs
        const pluginInstance = strapi[appConfig.app_name+'_pluginCache']
        const mappings = pluginInstance.mappings

        // TODO: in Strapi v4, we have no way of knowing what fields have been updated.
        // In Strapi v5, lifecycles and documents have completely changed and there's new features regarding document history... so we may 
        // be able to set it up such that ES is only updated if the explicit mapping fields have been updated.


        // TODO: This step can be pre-rendered one-time, any time a registered index or registered mapping gets updated
        // which would save processing time during lifecycle events
        // TODO: What is this doing exactly; do we need this?
        const mappingWithHydratedPresets = await populateMappingPresets(mappings, mapping)

        const recordForES = await extractRecordDataToIndex(mappingWithHydratedPresets, result)

        if (recordForES && Object.keys(recordForES).length > 0) {

            // NOTE: This prepares final ES-side id, e.g. "api::event.event::48"
            const preparedRecordID = getIndexItemId({contentTypeUid: mapping.content_type, itemId: result.id})

            await esInterface.ES_indexRecordToSpecificIndex(index, preparedRecordID, recordForES)
            await logsService.logIndexingPass('Indexing of single record complete: '+preparedRecordID)
        }
    } catch (error) {
        throw error
    }
    
    
}


const deleteSingleRecord = async (index:RegisteredIndex, content_type:string, recordStrapiId:string) => {

    try {
        const esInterface = strapi.plugins[appConfig.app_name].services.esInterface
        const logsService = strapi.plugins[appConfig.app_name].services.logs
        // NOTE: This prepares final ES-side id, e.g. "api::event.event::48"
        const preparedRecordID = getIndexItemId({contentTypeUid: content_type, itemId: recordStrapiId})

        esInterface.ES_removeItemFromIndex({itemId: preparedRecordID, indexName: index.index_name})
        await logsService.logIndexingPass('Deletion of single record complete: ' + preparedRecordID)
    } catch (error) {
        throw error
    }    
    
}


function getIndexItemId({contentTypeUid, itemId}):string {
    return contentTypeUid+'::' + itemId
}


const extractRecordDataToIndex = (mapping:Mapping, result:any) => {

    const finalRecord = {}

    // TODO: Add condition as to whether mapping is dynamic.
    // If not, do full logic, otherwise just return the entire record.

    // 1. If index is dynamic (or what ES calls "runtime"?), skip to step... xxx
    // 2. Loop through fields in mapping
    // 3. If a field is active and has a type, then we grab it
    // 4. Run final check to make sure there's no fields making it through?

    if (mapping && mapping.fields) {
        for (const [key, value] of Object.entries(mapping.fields)) {
            if (value.active && result[key]) {

                // If a preset mapping, process recursively
                if (value.preset_uuid && value.mapping) {
                    finalRecord[key] = extractRecordDataToIndex(value.mapping, result[key])
                } else {

                    // Add pin if geo location
                    // TODO: Need to account for actual geo data type
                    if (result.Location || (result.Latitude && result.Longitude)) {
                        const coords = {
                            "lat": result.Location ? result.Location.Latitude : result.Latitude,
                            "lon": result.Location ? result.Location.Longitude : result.Longitude
                        }
                        finalRecord['pin'] = {
                            "type": "geo_point",
                            ...coords
                        }
                    }

                    // TODO: 
                    // Need to account for: subfields, transforms, components, dynamiczones, relation, media, etc
                    // See legacy funcs

                    // TODO: And finally, for front-end convenience, we also append field "content_type" amongst the other fields
                    // This may not be necessary, but doing it for now.
                    finalRecord['content_type'] = mapping.content_type.split('.').pop()

                    finalRecord[key] = result[key]
                    
                }
            }
        }

    }

    return finalRecord
}




// =======================================
// LEGACY FUNCS
// Need to scrutinize
// =======================================

function extractRecordDataToIndex_LEGACY({contentTypeUid, data, collectionConfig}) {
    collectionConfig = modifySubfieldsConfigForExtractor(collectionConfig)
    const fti = Object.keys(collectionConfig[contentTypeUid])
    const document = {}

    for (let k = 0; k < fti.length; k++) {
        const fieldConfig = collectionConfig[contentTypeUid][fti[k]]
        if (fieldConfig.index) {
            let val:any = null
            if (Object.keys(fieldConfig).includes('subfields')) {
                val = extractSubfieldData({config: fieldConfig['subfields'], data: data[fti[k]]})
                val = val ? val.trim() : val
            } else {
                val = data[fti[k]]
                if (Object.keys(fieldConfig).includes('transform')
                && fieldConfig['transform'] === 'markdown') {
                    val = transformContent({content: val, from: 'markdown'})
                }
            }                    
            if (Object.keys(fieldConfig).includes('searchFieldName')) {
                document[fieldConfig['searchFieldName']] = val
            } else {
                document[fti[k]] = val
            }
        }
    }
    return document
}

function modifySubfieldsConfigForExtractor(collectionConfig):object {
    const contentTypeUid = Object.keys(collectionConfig)[0]
    const attributes = Object.keys(collectionConfig[contentTypeUid])
    for (let r=0; r< attributes.length; r++) {
        const attr = attributes[r]
        const attribFields = Object.keys(collectionConfig[contentTypeUid][attr])
        if (attribFields.includes('subfields')) {
            const subfielddata = collectionConfig[contentTypeUid][attr]['subfields']
            if (subfielddata.length > 0) {
                try {
                    const subfieldjson = JSON.parse(subfielddata)
                    if (Object.keys(subfieldjson).includes('subfields')) {
                        collectionConfig[contentTypeUid][attr]['subfields'] = subfieldjson['subfields']
                    }
                } catch(error) {
                    continue
                }
            }
        }
    }
    return collectionConfig
}


function extractSubfieldData({config, data }) {
    let returnData = ''
    if (Array.isArray(data)) {
        const dynDataItems = data
        for (let r=0; r< dynDataItems.length; r++) {
            const extractItem = dynDataItems[r]
            for (let s=0; s<config.length; s++) {
                const conf = config[s]
                if (Object.keys(extractItem).includes('__component')) {

                    if (conf.component === extractItem.__component
                    && !Object.keys(conf).includes('subfields')
                    && typeof extractItem[conf['field']] !== "undefined"
                    && extractItem[conf['field']]) {

                        let val = extractItem[conf['field']]
                        if (Object.keys(conf).includes('transform')
                        && conf['transform'] === 'markdown') {

                            val = transformContent({content: val, from: 'markdown'})
                            returnData = returnData + '\n' + val
                        }
                    } else if (conf.component === extractItem.__component
                    && Object.keys(conf).includes('subfields')) {

                        returnData = returnData + '\n' + extractSubfieldData({ config: conf['subfields'], data: extractItem[conf['field']] })
                    }
                } else {
                    if (!Object.keys(conf).includes('subfields')
                    && typeof extractItem[conf['field']] !== "undefined"
                    && extractItem[conf['field']]) {

                        let val = extractItem[conf['field']]
                        if (Object.keys(conf).includes('transform')
                        && conf['transform'] === 'markdown') {
                            val = transformContent({content: val, from: 'markdown'})
                            returnData = returnData + '\n' + val
                        }
                    } else if (Object.keys(conf).includes('subfields')) {
                        returnData = returnData + '\n' + extractSubfieldData({ config: conf['subfields'], data: extractItem[conf['field']] })
                    }
                }
            }
        }
    
    // For single component as a field
    } else {

        for (let s=0; s<config.length; s++) {
            const conf = config[s]
            if (!Object.keys(conf).includes('subfields')
            && typeof data[conf['field']] !== "undefined"
            && data[conf['field']]) {
                returnData = returnData + '\n' + data[conf['field']]
            } else if (Object.keys(conf).includes('subfields')) {
                returnData = returnData + '\n' + extractSubfieldData({ config: conf['subfields'], data: data[conf['field']] })
            }
        }

    }
    return returnData
}


function transformContent({content, from}) {
    if (from === 'markdown') {
        return transformMarkdownToText(content)
    } else {
        return from
    }
}
function transformMarkdownToText(md) {
    let text = md
    try {
        text = markdownToTxt(md)
    }
    catch(error) {
        console.error('ES transformMarkdownToText: Error while transforming markdown to text.')
        console.error(error)
    }
    return text
}



function getFullPopulateObject(modelUid, maxDepth = 20, ignore?) {
    const skipCreatorFields = true

    if (maxDepth <= 1) {
        return true
    }
    if (modelUid === "admin::user" && skipCreatorFields) {
        return undefined
    }

    const populate = {}
    const model = strapi.getModel(modelUid)
    
    if (ignore && !ignore.includes(model.collectionName)) {
        ignore.push(model.collectionName)
    }

    for (const [key, valueRaw] of Object.entries(getModelPopulationAttributes(model))) {

        let value:any = valueRaw

        if (ignore?.includes(key)) continue
        
        if (value) {
            
            if (value.type === "component") {
                populate[key] = getFullPopulateObject(value.component, maxDepth - 1)
            } else if (value.type === "dynamiczone") {
                const dynamicPopulate = value.components.reduce((prev, cur) => {
                    const curPopulate = getFullPopulateObject(cur, maxDepth - 1)
                    return curPopulate === true ? prev : merge(prev, curPopulate)
                }, {})
                populate[key] = isEmpty(dynamicPopulate) ? true : dynamicPopulate
            } else if (value.type === "relation") {
                const relationPopulate = getFullPopulateObject(value.target, (key === 'localizations') && maxDepth > 2 ? 1 : maxDepth - 1, ignore)
                if (relationPopulate) {
                    populate[key] = relationPopulate
                }
            } else if (value.type === "media") {
                populate[key] = true
            }
        }
    }
    return isEmpty(populate) ? true : { populate }
}

function getModelPopulationAttributes(model) {
    if (model.uid === "plugin::upload.file") {
        const { related, ...attributes } = model.attributes
        return attributes
    }
    return model.attributes
}



// TODO:
// RANDOM NOTE FROM SOMEWHERE
// Maybe useful; or just delete this

/*
//Example config to cover extraction cases
collectionConfig[collectionName] = {
    'major': {index: true},
    'sections': { index: true, searchFieldName: 'information',
        'subfields': [
            { 'component': 'try.paragraph',
                'field': 'Text'}, 
            { 'component': 'try.paragraph',
                'field': 'Heading'},
            { 'component': 'try.footer',
                'field': 'footer_link',
                'subfields':[ {
                    'component': 'try.link',
                    'field': 'display_text'
                }] 
            }] },
    'seo_details': {
        index: true, searchFieldName: 'seo',
        'subfields': [
            {
                'component': 'try.seo',
                'field': 'meta_description'
            }
        ]
    },
    'changelog': {
        index: true, searchFieldName: 'breakdown',
        'subfields': [
            {
                'component': 'try.revision',
                'field': 'summary'
            }
        ]
    }
}
*/ 