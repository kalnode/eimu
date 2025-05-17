"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => {
    const indexes = strapi.plugins[app_config_1.default.app_name].services.indexes;
    const getIndex = async (ctx) => {
        try {
            return await indexes.getStoreIndex(ctx.params.indexUUID);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const getIndexes = async (ctx) => {
        try {
            return await indexes.getStoreIndexes();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const createIndex = async (ctx) => {
        const { body } = ctx.request;
        try {
            console.log("createIndex ctx is:", body.data);
            return await indexes.createIndex(body.data.indexName, body.data.usePrepend, body.data.addToExternalIndex);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const updateIndex = async (ctx) => {
        const { body } = ctx.request;
        try {
            return await indexes.updateIndex(ctx.params.indexUUID, body.data);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    // const toggleDynamicMappingOnIndex = async (ctx) => {
    //     try {
    //         return await indexes.toggleDynamicMappingOnIndex(ctx.params.indexUUID)
    //     } catch (error) {
    //         ctx.throw(500, error)
    //     }
    // }
    const deleteIndex = async (ctx) => {
        const { body } = ctx.request;
        try {
            return await indexes.deleteIndex(body.data.indexUUID, body.data.deleteIndexInElasticsearch);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const createESindex = async (ctx) => {
        try {
            return await indexes.createESindex(ctx.params.indexUUID);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const getESMapping = async (ctx) => {
        try {
            return await indexes.getESMapping(ctx.params.indexUUID);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const syncIndexWithExternal = async (ctx) => {
        try {
            return await indexes.syncIndexWithExternal(ctx.params.indexUUID);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    return {
        getIndex,
        getIndexes,
        createIndex,
        deleteIndex,
        updateIndex,
        createESindex,
        getESMapping,
        //toggleDynamicMappingOnIndex,
        syncIndexWithExternal
    };
};
