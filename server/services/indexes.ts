import shortuuid from 'short-uuid'
import { RegisteredIndex, Mapping, MappingField } from "../../types"
import { removeUndefineds, convertMappingsToESMappings, populateMappingPresets } from "../../scripts"
import appConfig from '../../app.config'

export default ({ strapi }) => ({

    async getStoreIndex(indexUUID:string) {

        try {

            // NOTE: Here we make a regular non-cached pull because this func is triggered on plugin boot.
            const pluginStore = strapi.plugins[appConfig.app_name].services.helper.getPluginStore()
            const indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })

            if (indexes && Array.isArray(indexes)) {
                let work = indexes.find( (x:RegisteredIndex) => x.uuid === indexUUID)
                if (work) {
                    return work
                } else {
                    throw "No index found"
                }
            } else {
                throw "No indexes found"
            }

        } catch(error) {
            console.error('SERVICE indexes getStoreIndex - error:', error)
            throw error
        }

    },

    async getStoreIndexes() {

        try {

            // NOTE: Here we make a regular non-cached pull because this func is triggered on plugin boot.
            const pluginStore = strapi.plugins[appConfig.app_name].services.helper.getPluginStore()
            const indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })

            if (indexes) {
                return indexes
            } else {
                return []
            }

        } catch(error) {
            console.error('SERVICE indexes getStoreIndexes - error:', error)
            throw error
        }

    },

    async createIndex(indexName:string, usePrepend?:boolean, addToExternalIndex?:boolean) {

        try {
            const newIndexName = usePrepend ? 'strapi_es_plugin_' + indexName : indexName

            const finalPayload:RegisteredIndex = {
                uuid: indexName + "_" + shortuuid().new(),
                index_name: newIndexName,
                active: true,
                mappings: []
            }

            const pluginInstanceCached = strapi[appConfig.app_name+'_pluginCache']
            let indexes:Array<RegisteredIndex> = pluginInstanceCached.indexes

            if (!indexes) {
                indexes = []
            }

            indexes.push(finalPayload)

            const pluginStore = strapi.plugins[appConfig.app_name].services.helper.getPluginStore()
            await pluginStore.set({ key: 'indexes', value: indexes })

            if (addToExternalIndex) {
                const esInterface = strapi.plugins[appConfig.app_name].services.esInterface
                await esInterface.ES_createIndex(newIndexName)
            }

            return finalPayload

        } catch(error) {
            console.error('SERVICE indexes createIndex - error:', error)
            throw error
        }

    },  

    async updateIndex(indexUUID:string, payload:RegisteredIndex) {

        try {

            const pluginInstanceCached = strapi[appConfig.app_name+'_pluginCache']
            let indexes = pluginInstanceCached.indexes

            let foundIndexNumber:number = indexes.findIndex( (x:RegisteredIndex) => x.uuid === indexUUID)

            if (foundIndexNumber >= 0 && indexes[foundIndexNumber] != payload) {
                indexes[foundIndexNumber] = { ...indexes[foundIndexNumber], ...payload }
                const pluginStore = strapi.plugins[appConfig.app_name].services.helper.getPluginStore()
                await pluginStore.set({ key: 'indexes', value: indexes })
                return indexes[foundIndexNumber]
            } else {
                throw "No index found"
            }
            
        } catch(error) {
            console.error('SERVICE indexes updateIndex - error:', error)
            throw error
        }

    },

    async deleteIndex(indexUUID:string, deleteIndexInElasticsearch:boolean) {

        try {

            const pluginInstanceCached = strapi[appConfig.app_name+'_pluginCache']
            let indexes:Array<RegisteredIndex> = pluginInstanceCached.indexes

            if (indexes && Array.isArray(indexes) && indexes.length) {
                const foundIndexNumber:number = indexes.findIndex( (x:RegisteredIndex) => x.uuid === indexUUID)

                if (foundIndexNumber >= 0) {

                    indexes.splice(foundIndexNumber, 1)

                    if (indexes[foundIndexNumber] && deleteIndexInElasticsearch) {
                        const esInterface = strapi.plugins[appConfig.app_name].services.esInterface
                        await esInterface.ES_deleteIndex(indexes[foundIndexNumber].index_name)
                    }

                }
            }

            const pluginStore = strapi.plugins[appConfig.app_name].services.helper.getPluginStore()
            await pluginStore.set({ key: 'indexes', value: indexes && indexes.length ? indexes : null })

            return "Success - Index deleted"

        } catch(error) {
            console.error('SERVICE indexes deleteIndex - error:', error)
            throw error
        }

    },

    async getContentTypesForIndexing() {

        const pluginInstanceCached = strapi[appConfig.app_name+'_pluginCache']
        const indexes = pluginInstanceCached.indexes
        const mappings = pluginInstanceCached.mappings

        let uniqueTypes:Array<string> = []

        if (indexes) {
            for (let x = 0; x < indexes.length; x++) {
                const index = indexes[x]
                if (index.mappings) {
                    for (let y = 0; y < index.mappings.length; y++) {
                        const mappingUUID:string = index.mappings[y]
                        const mapping = mappings.find( (z:Mapping) => z.uuid === mappingUUID)
                        if (mapping && !uniqueTypes.includes(mapping.content_type)) {
                            uniqueTypes.push(mapping.content_type)
                        }
                    }
                }
            }
        }
        return uniqueTypes

    },


    // ==================
    // ES STUFF
    // ==================

    async syncMappingsWithExternal() {

        try {

            const pluginInstanceCached = strapi[appConfig.app_name+'_pluginCache']
            const indexes = pluginInstanceCached.indexes
            const mappings = pluginInstanceCached.mappings
    
            if (mappings && indexes) {
                mappings.forEach( (x:Mapping) => {
                    const matchedIndexes:Array<RegisteredIndex> = indexes.filter( (y:RegisteredIndex) => y.mappings && x.uuid && y.mappings.includes(x.uuid))
                    matchedIndexes.forEach( async (x:RegisteredIndex) => {
                        const indexesService = strapi.plugins[appConfig.app_name].services.indexes
                        await indexesService.syncIndexWithExternal(x.uuid)
                    })
                })
            }

        } catch(error) {
            console.error('SERVICE indexes syncMappingsWithExternal - error:', error)
            throw error
        }

    },


    async syncIndexWithExternal(indexUUID:string) {

        try {

            const pluginInstanceCached = strapi[appConfig.app_name+'_pluginCache']
            const indexes = pluginInstanceCached.indexes
            const mappings = pluginInstanceCached.mappings            
            const index = indexes.find( (x:RegisteredIndex) => x.uuid === indexUUID)
    
            if (index) {

                // 1. Check overall settings
                // 2. Check mappings

                //const externalMappings = await esInterface.ES_getMapping(index.index_name)
                let mappingFieldsFinal:MappingField = {}

                if (mappings && index.mappings) {
                    let mappingsMatched = mappings.filter( (x:Mapping) => x.uuid && index.mappings && index.mappings.includes(x.uuid))

                    // 1 - Go through each mapping in index.mappings
                    // and make sure anything that uses a preset gets fully populated
                    for (let x = 0; x < index.mappings.length; x++) {

                        const mappingUUID:string = index.mappings[x]
                        let mapping = mappingsMatched.find( (y:Mapping) => y.uuid === mappingUUID)

                        if (mapping && mapping.fields) {
                            const convertWork = populateMappingPresets(mappings, mapping)
                            mapping = convertWork
                        }

                    }

                    // 2 - Scrub through entire tree and convert to ES mapping
                    mappingFieldsFinal = convertMappingsToESMappings(mappingsMatched)
                }

                // REMOVED UNDEFINED PROPERTIES
                // TODO: This step seems silly; perhaps we can simply not create the item if it has no type.
                // TODO: This is not recursive for nested properties; look into it.
                removeUndefineds(mappingFieldsFinal)
                //Object.keys(mappingFieldsFinal).forEach(key => mappingFieldsFinal[key] === undefined && delete mappingFieldsFinal[key])

                // "properties": {
                //     "pin": {
                //         type: "geo_point",
                //         index: true
                //     },
                //     "Participants": {
                //         type: "nested"
                //     },
                //     "Organizers": {
                //         type: "nested"
                //     },
                //     "child_terms": {
                //         type: "nested"
                //     },                            
                //     // "uuid": {
                //     //     type: "string",
                //     //     index: "not_analyzed"
                //     // }
                // }

                // "mappings": {
                //     "dynamic": false, 
                //     "properties": {
                //       "user": { 
                //         "properties": {
                //           "name": {
                //             "type": "text"
                //           },
                //           "social_networks": {
                //             "dynamic": true, 
                //             "properties": {}
                //           }
                //         }
                //       }
                //     }
                //   }

                // TODO: Apply ES typing here
                let finalPayload:any = {}

                // TODO: Add enum typing here?
                if (index.mapping_type != undefined) {
                    finalPayload.dynamic = index.mapping_type // ? 'true' : 'runtime'
                }

                if (mappingFieldsFinal && Object.keys(mappingFieldsFinal).length > 0) {
                    finalPayload.properties = mappingFieldsFinal

                    const esInterface = strapi.plugins[appConfig.app_name].services.esInterface
                    await esInterface.ES_updateMapping({indexName: index.index_name, mapping: finalPayload})
    
                    return "Success - Index syncd with external ES"
                }

                throw "Not syncing: empty payload"

                
            }

        } catch(error) {
            console.error('SERVICE indexes syncIndexWithExternal - error:', error)
            throw error
        }

    },

    async createESindex(indexUUID:string) {

        try {

            const esInterface = strapi.plugins[appConfig.app_name].services.esInterface
            const indexesService = strapi.plugins[appConfig.app_name].services.indexes

            let index = await indexesService.getStoreIndex(indexUUID)
            if (index) {

                try {
                    await esInterface.ES_createIndex(index.index_name)
                } catch(error) {
                    throw error
                }

                try {
                    await this.syncIndexWithExternal(indexUUID)
                } catch(error) {
                    return "Success - Created ES index, however no mappings were applied since they're empty."
                }

                return "Success - Created ES index and sync'd"

            } else {
                throw "No registered index found"
            }

        } catch(error) {
            console.error('SERVICE indexes createESindex - error:', error)
            throw error
        }

    },

    async getESMapping(indexUUID:string) {

        try {
            const esInterface = strapi.plugins[appConfig.app_name].services.esInterface
            const indexesService = strapi.plugins[appConfig.app_name].services.indexes
            const index:RegisteredIndex = await indexesService.getStoreIndex(indexUUID)

            if (index) {
                return await esInterface.ES_getMapping(index.index_name)
            } else {
                throw "No index found"
            }

        } catch(error) {
            console.error('SERVICE indexes getESMapping - error:', error)
            throw error
        }

    }

})