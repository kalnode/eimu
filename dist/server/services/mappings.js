"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const short_uuid_1 = __importDefault(require("short-uuid"));
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => ({
    async getStoreMapping(mappingUUID) {
        try {
            // NOTE: Here we make a regular non-cached pull because this func is triggered on plugin boot.
            const pluginStore = strapi.plugins[app_config_1.default.app_name].services.helper.getPluginStore();
            const mappings = await pluginStore.get({ key: 'mappings' });
            if (mappingUUID) {
                if (mappings && Array.isArray(mappings)) {
                    let work = mappings.find((x) => x.uuid === mappingUUID);
                    if (work) {
                        return work;
                    }
                    else {
                        throw "No mapping found";
                    }
                }
            }
            else {
                throw "No mapping UUID provided";
            }
        }
        catch (error) {
            console.error('SERVICE mappings getStoreMapping - error:', error);
            throw error;
        }
    },
    async getStoreMappings(indexUUID) {
        try {
            // NOTE: Here we make a regular non-cached pull because this func is triggered on plugin boot.
            const pluginStore = strapi.plugins[app_config_1.default.app_name].services.helper.getPluginStore();
            let mappings = await pluginStore.get({ key: 'mappings' });
            if (mappings) {
                if (indexUUID) {
                    const indexesService = strapi.plugins[app_config_1.default.app_name].services.indexes;
                    const index = await indexesService.getStoreIndex(indexUUID);
                    if (index && index.mappings) {
                        mappings = mappings.filter((x) => x.uuid && index.mappings && index.mappings.includes(x.uuid));
                    }
                }
                return mappings;
            }
            else {
                return [];
            }
        }
        catch (error) {
            console.error('SERVICE mappings getStoreMappings - error:', error);
            throw error;
        }
    },
    async createMapping(mapping) {
        try {
            const finalPayload = {
                ...mapping,
                uuid: (0, short_uuid_1.default)().new()
            };
            const pluginInstanceCached = strapi[app_config_1.default.app_name + '_pluginCache'];
            let mappings = pluginInstanceCached.mappings;
            if (!mappings) {
                mappings = [];
            }
            mappings.push(finalPayload);
            const pluginStore = strapi.plugins[app_config_1.default.app_name].services.helper.getPluginStore();
            await pluginStore.set({ key: 'mappings', value: mappings });
            if (finalPayload.indexes && finalPayload.uuid) {
                await this.attachMapping(finalPayload.indexes[0], finalPayload.uuid);
            }
            return finalPayload;
        }
        catch (error) {
            console.error('SERVICE mappings createMapping - error:', error);
            throw error;
        }
    },
    async updateMapping(mapping) {
        try {
            const pluginInstanceCached = strapi[app_config_1.default.app_name + '_pluginCache'];
            let mappings = pluginInstanceCached.mappings;
            if (mappings && Array.isArray(mappings)) {
                // TODO: Probably a more elegant way to do this.
                const foundIndex = mappings.findIndex((x) => x.uuid === mapping.uuid);
                if (foundIndex >= 0) {
                    mappings[foundIndex] = mapping;
                    const pluginStore = strapi.plugins[app_config_1.default.app_name].services.helper.getPluginStore();
                    await pluginStore.set({ key: 'mappings', value: mappings });
                    return mapping;
                }
                else {
                    throw "Cannot find mapping to update";
                }
            }
            else {
                throw "No mappings found; cannot update";
            }
        }
        catch (error) {
            console.error('SERVICE mappings updateMapping - error:', error);
            throw error;
        }
    },
    async updateMappings(mappings) {
        try {
            const pluginInstanceCached = strapi[app_config_1.default.app_name + '_pluginCache'];
            let mappings = pluginInstanceCached.mappings;
            if (mappings && Array.isArray(mappings)) {
                for (let i = 0; i < mappings.length; i++) {
                    let mapping = mappings[i];
                    let foundIndex = mappings.findIndex((x) => x.uuid === mapping.uuid);
                    if (foundIndex >= 0) {
                        mappings[foundIndex] = mapping;
                    }
                    else {
                        throw "Cannot find mapping to update";
                    }
                }
            }
            else {
                throw "Cannot find mappings";
            }
            const pluginStore = strapi.plugins[app_config_1.default.app_name].services.helper.getPluginStore();
            await pluginStore.set({ key: 'mappings', value: mappings });
            return "Success - mappings updated";
        }
        catch (error) {
            console.error('SERVICE mappings updateMappings - error:', error);
            throw error;
        }
    },
    async attachMapping(indexUUID, mappingUUID) {
        try {
            if (indexUUID && mappingUUID) {
                const indexesService = strapi.plugins[app_config_1.default.app_name].services.indexes;
                let index = await indexesService.getStoreIndex(indexUUID);
                if (index.mappings) {
                    if (index.mappings.includes(mappingUUID)) {
                        throw "Mapping already attached";
                    }
                }
                else {
                    index.mappings = [];
                }
                index.mappings.push(mappingUUID);
                await indexesService.updateIndex(indexUUID, index);
                return "Success - Mapping attached to index";
            }
            else {
                throw "Need indexUUID & mappingUUID";
            }
        }
        catch (error) {
            console.error('SERVICE mappings attachMapping - error:', error);
            throw error;
        }
    },
    async detachMapping(indexUUID, mappingUUID) {
        try {
            const indexesService = strapi.plugins[app_config_1.default.app_name].services.indexes;
            const index = await indexesService.getStoreIndex(indexUUID);
            if (index && index.mappings) {
                index.mappings = index.mappings.filter((x) => x !== mappingUUID);
                await indexesService.updateIndex(indexUUID, index);
                return "Success - Mapping detached from index";
            }
            else {
                throw "Fail - No index found";
            }
        }
        catch (error) {
            console.error('SERVICE mappings detachMapping - error:', error);
            throw error;
        }
    },
    async deleteMapping(mappingUUID) {
        try {
            const pluginInstanceCached = strapi[app_config_1.default.app_name + '_pluginCache'];
            let mappings = pluginInstanceCached.mappings;
            if (mappings && Array.isArray(mappings)) {
                const foundIndex = mappings.findIndex((x) => x.uuid === mappingUUID);
                if (foundIndex >= 0) {
                    const mapping = mappings[foundIndex];
                    const indexesService = strapi.plugins[app_config_1.default.app_name].services.indexes;
                    let indexes = await indexesService.getStoreIndexes();
                    if (indexes && Array.isArray(indexes) && indexes.length > 0) {
                        indexes = indexes.filter((x) => x.mappings && mapping.uuid && x.mappings.includes(mapping.uuid));
                        if (indexes) {
                            for (let i = 0; i < indexes.length; i++) {
                                await this.detachMapping(indexes[i].uuid, mapping.uuid);
                            }
                        }
                    }
                    mappings.splice(foundIndex, 1);
                }
            }
            // TODO: Add check whether mappings actually updated; if not, avoid this transaction
            const pluginStore = strapi.plugins[app_config_1.default.app_name].services.helper.getPluginStore();
            await pluginStore.set({ key: 'mappings', value: mappings.length ? mappings : null });
            return "Success - Mapping deleted";
        }
        catch (error) {
            console.error('SERVICE mappings deleteMapping - error:', error);
            throw error;
        }
    }
});
