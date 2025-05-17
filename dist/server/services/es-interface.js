"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
const app_config_1 = __importDefault(require("../../app.config"));
let ES_CLIENT;
exports.default = ({ strapi }) => ({
    async ES_checkConnection() {
        try {
            if (!ES_CLIENT) {
                throw "ES client library not initialized";
            }
            return await ES_CLIENT.ping();
        }
        catch (error) {
            return 'SERVICE es-interface ES_checkConnection error:' + error;
        }
    },
    async ES_initialize({ hostfull, host, uname, password, cert }) {
        try {
            if (hostfull) {
                ES_CLIENT = await new elasticsearch_1.Client({
                    node: hostfull,
                    //log: 'trace', // TODO: disabling because TS error. What is this, why do we need it? From legacy plugin.
                    tls: {
                        rejectUnauthorized: false
                    }
                });
            }
            else {
                ES_CLIENT = await new elasticsearch_1.Client({
                    node: host,
                    auth: {
                        username: uname,
                        password: password
                    },
                    //log: 'trace', // TODO: disabling because TS error. What is this, why do we need it? From legacy plugin.
                    // KAL - Disabling tls to get Strapi working on Heroku deploy.
                    // Possibly don't need this because the ES instance is on the same host (perhaps we need to restrict it to same-domain?)... or... Heroku handles SSL outside of the app running on the instance.
                    tls: {
                        //ca: fs.readFileSync('./config'+cert), //fs.readFileSync('./http_ca.crt'), //cert,
                        rejectUnauthorized: false
                    }
                });
            }
        }
        catch (error) {
            if (error.message.includes('ECONNREFUSED')) {
                console.error('SERVICE es-interface ES_initialize error: Connection to ElasticSearch at ', host, ' refused.');
                console.error(error);
            }
            else {
                console.error('SERVICE es-interface ES_initialize error:', error);
            }
            return error;
        }
    },
    async ES_getIndexes() {
        try {
            this.ES_checkConnection();
            // TODO: Which way is better? _all vs *
            //return await ES_CLIENT.indices.get({ index: "_all" })
            return await ES_CLIENT.indices.get({ index: "*" });
        }
        catch (error) {
            console.error('SERVICE es-interface ES_getIndexes error:', error);
            return error;
        }
    },
    async ES_createIndex(indexName) {
        try {
            this.ES_checkConnection();
            const exists = await ES_CLIENT.indices.exists({ index: indexName });
            if (!exists) {
                const work = await ES_CLIENT.indices.create({
                    index: indexName,
                    mappings: {
                        dynamic: false
                    }
                })
                    .catch((error) => {
                    throw "Cannot create index due to technical issue";
                });
                if (work !== null && work !== undefined) {
                    return "ES index created successfully";
                }
                else {
                    throw "Reindexing unsuccessful";
                }
            }
            else {
                throw "ES index already exists!";
            }
        }
        catch (error) {
            return error;
        }
    },
    async ES_deleteIndex(indexName) {
        try {
            this.ES_checkConnection();
            const exists = await ES_CLIENT.indices.exists({ index: indexName });
            if (exists) {
                await ES_CLIENT.indices.delete({
                    index: indexName
                });
                return "ES successfully deleted";
            }
            else {
                throw "ES index not found; no deletion occurred";
            }
        }
        catch (error) {
            console.error('SERVICE es-interface ES_deleteIndex error:', error);
            return error;
        }
    },
    async ES_cloneIndex(indexName, targetName) {
        try {
            this.ES_checkConnection();
            const exists = await ES_CLIENT.indices.exists({ index: indexName });
            const existsTarget = await ES_CLIENT.indices.exists({ index: targetName });
            if (!exists) {
                throw "Original ES index not found; no cloning occurred";
            }
            if (existsTarget) {
                throw "Target index name already exists";
            }
            // First, add a block to stop new writes happening during this process.
            await ES_CLIENT.indices.addBlock({
                index: indexName,
                block: "write",
            });
            // Second, actually clone the index
            await ES_CLIENT.indices.clone({
                index: indexName,
                target: targetName
            })
                .catch((error) => {
                // TODO: Bug? There's perhaps some bug with this specific returned error from the ES api.
                // Ideally we just pass it with "throw error", like everywhere else, however server
                // console complains about "TypeError: Cannot set property statusCode of Error... which has only a getter...".
                // And as such it doesn't pass the ES error message back, this in admin UI we don't see a proper error message.
                // FOR NOW: This works and is displayed in admin UI:
                throw "Cannot clone index due to technical issue";
            });
            // Third, remove original block
            // TODO: Confirm this is proper ES way.
            // It seems like to remove the earlier block, we use an entirely different API.
            await ES_CLIENT.indices.putSettings({
                index: indexName,
                settings: {
                    blocks: {
                        write: false
                    }
                }
            });
            return "ES successfully cloned";
        }
        catch (error) {
            console.error('SERVICE es-interface ES_cloneIndex error:', error);
            return error;
        }
    },
    async ES_reindexIndex(indexName, targetName) {
        try {
            this.ES_checkConnection();
            const exists = await ES_CLIENT.indices.exists({ index: indexName });
            const existsTarget = await ES_CLIENT.indices.exists({ index: targetName });
            if (!exists) {
                throw "Original ES index not found; no cloning occurred";
            }
            if (existsTarget) {
                throw "Target index name already exists";
            }
            const workNewInstance = await ES_CLIENT.indices.create({
                index: targetName
            });
            const existsNew = await ES_CLIENT.indices.exists({ index: targetName });
            if (existsNew) {
                const work = await ES_CLIENT.reindex({
                    source: {
                        index: indexName
                    },
                    dest: {
                        index: targetName
                    }
                })
                    .then((response) => {
                    console.log("reindex response is: ", response);
                    return response;
                })
                    .catch((error) => {
                    throw error;
                });
                if (work !== null && work !== undefined) {
                    console.log("reindex work is: ", work);
                    return "ES successfully re-indexed into new index";
                }
                else {
                    throw "Reindexing unsuccessful";
                }
            }
        }
        catch (error) {
            console.error('SERVICE es-interface ES_reindexIndex error:', error);
            return error;
        }
    },
    /**
     *
     * ALIASES
     *
     */
    async attachAliasToIndex(indexName) {
        try {
            this.ES_checkConnection();
            const pluginConfig = await strapi.config.get('plugin.' + app_config_1.default.app_name);
            const aliasName = pluginConfig.indexAliasName;
            if (aliasName) {
                const aliasExists = await ES_CLIENT.indices.existsAlias({ name: aliasName });
                const esInterface = strapi.plugins[app_config_1.default.app_name].services.esInterface;
                if (aliasExists) {
                    await ES_CLIENT.indices.deleteAlias({ index: '*', name: aliasName });
                }
                const indexExists = await ES_CLIENT.indices.exists({ index: indexName });
                if (!indexExists) {
                    await esInterface.ES_createIndex(indexName);
                }
                await ES_CLIENT.indices.putAlias({ index: indexName, name: aliasName });
                return "Success - Alias attached to index";
            }
        }
        catch (error) {
            if (error.message.includes('ECONNREFUSED')) {
                console.error('SERVICE es-interface attachAliasToIndex error: Connection to ElasticSearch refused error:', error);
            }
            else {
                console.error('SERVICE es-interface attachAliasToIndex error:', error);
            }
            return error;
        }
    },
    /**
     *
     * MAPPINGS
     *
     */
    async ES_toggleDynamicMapping(indexName) {
        try {
            this.ES_checkConnection();
            let workCheck = await ES_CLIENT.indices.exists({ index: indexName });
            if (workCheck) {
                let mapping = await ES_CLIENT.indices.getMapping({ index: indexName });
                //mapping.dynamic = !mapping.dynamic
                this.ES_updateMapping({ indexName, mapping });
            }
            return "Success - Dynamic mapping toggled on ES";
        }
        catch (error) {
            console.error('SERVICE es-interface ES_toggleDynamicMapping error:', error);
            return error;
        }
    },
    async ES_getMapping(indexName) {
        try {
            this.ES_checkConnection();
            let workCheck = await ES_CLIENT.indices.exists({ index: indexName });
            if (workCheck) {
                return await ES_CLIENT.indices.getMapping({ index: indexName })
                    // TODO: Does this catch and throw matter? What if we eliminate it?
                    .catch((error) => {
                    throw error;
                });
            }
            else {
                throw "No index found";
            }
        }
        catch (error) {
            console.error('SERVICE es-interface ES_getMapping error:', error);
            return error;
        }
    },
    async ES_updateMapping({ indexName, mapping }) {
        // NOTE: New new mappings can be added to an index.
        // or some properties of existing mappings.
        // However you cannot change the mapping itself for an existing index.
        try {
            if (mapping && Object.keys(mapping).length > 0) {
                this.ES_checkConnection();
                await ES_CLIENT.indices.putMapping({ index: indexName, ...mapping });
                return "Success - ES mapping updated";
            }
            else {
                throw 'No mapping supplied';
            }
        }
        catch (error) {
            console.error('SERVICE es-interface ES_updateMapping error:', error);
            return error;
        }
    },
    /**
     *
     * INDEXING OF RECORDS
     *
     */
    async ES_indexRecordToSpecificIndex_Old({ itemId, itemData }, indexName) {
        try {
            this.ES_checkConnection();
            await ES_CLIENT.index({
                index: indexName,
                id: itemId,
                document: itemData
            });
            await ES_CLIENT.indices.refresh({ index: indexName });
            return "Success - record indexed on ES";
        }
        catch (error) {
            console.error('SERVICE es-interface ES_indexRecordToSpecificIndex error:', error);
            return error;
        }
    },
    async ES_indexRecordToSpecificIndex(index, itemId, itemData) {
        try {
            this.ES_checkConnection();
            await ES_CLIENT.index({
                index: index.index_name,
                id: itemId,
                document: itemData
            });
            await ES_CLIENT.indices.refresh({ index: index.index_name });
            return "Success - record indexed on ES";
        }
        catch (error) {
            console.error('SERVICE es-interface ES_indexRecordToSpecificIndex error:', error);
            return error;
        }
    },
    async ES_indexData({ itemId, itemData, index }) {
        try {
            this.ES_checkConnection();
            // TODO: THis needs to be re-built for new paradigm.
            const pluginConfig = await strapi.config.get('plugin.' + app_config_1.default.app_name);
            return await this.ES_indexRecordToSpecificIndex(itemId, pluginConfig.indexAliasName, itemData);
        }
        catch (error) {
            console.error('SERVICE es-interface ES_indexData error:', error);
            return error;
        }
    },
    async ES_removeItemFromIndex({ itemId, indexName }) {
        try {
            if (itemId && indexName) {
                this.ES_checkConnection();
                if (await ES_CLIENT.indices.exists({ index: indexName })) {
                    if (await ES_CLIENT.exists({ index: indexName, id: itemId })) {
                        await ES_CLIENT.delete({ index: indexName, id: itemId });
                        await ES_CLIENT.indices.refresh({ index: indexName });
                        return "Delete success";
                    }
                    else {
                        return "Record does not exist on index: " + itemId;
                    }
                }
                else {
                    throw "Index does not exist: " + indexName;
                }
            }
            else {
                throw "Problem with params for ES_removeItemFromIndex";
            }
        }
        catch (error) {
            console.error('SERVICE es-interface ES_removeItemFromIndex error:', error);
            return error;
        }
    },
    // async updateDataToSpecificIndex({ itemId, itemData }, iName) {
    //     try {
    //this.ES_checkConnection()
    //         await client.index({
    //             index: iName,
    //             id: itemId,
    //             document: itemData
    //         })
    //         await client.indices.refresh({ index: iName })
    // } catch(error) {
    //     console.error('SERVICE es-interface updateDataToSpecificIndex error:', error)
    //     throw error
    // }
    // },
    // async updateData({itemId, itemData}) {
    //     const pluginConfig = await strapi.config.get('plugin.'+appConfig.app_name)
    //     return await this.ES_indexRecordToSpecificIndex({ itemId, itemData }, pluginConfig.indexAliasName)
    // },
    /**
     *
     * SEARCHING
     *
     */
    async ES_searchData(searchQuery) {
        // TODO: Typescript would help here.
        // searchQuery needs to be in a shape that ES understands, otherwise 500 error will be thrown.
        // Example:
        // query: {
        //     match: {
        //         Title: 'Cogo atqui ver utroq'
        //     }
        // }
        try {
            this.ES_checkConnection();
            const pluginConfig = await strapi.config.get('plugin.' + app_config_1.default.app_name);
            // DOCS FOR PAGING ES:
            // https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html
            const result = await ES_CLIENT.search({
                index: pluginConfig.indexAliasName,
                from: 0,
                size: 9999,
                ...searchQuery
            });
            return result;
        }
        catch (error) {
            console.error('SERVICE es-interface ES_searchData error:', error);
            return error;
        }
    }
});
