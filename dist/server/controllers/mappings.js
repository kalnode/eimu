"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => {
    const mappings = strapi.plugins[app_config_1.default.app_name].services.mappings;
    const getMapping = async (ctx) => {
        try {
            return await mappings.getStoreMapping(ctx.params.mappingUUID);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const getMappings = async (ctx) => {
        try {
            return await mappings.getStoreMappings(ctx.params.indexUUID);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const createMapping = async (ctx) => {
        const { body } = ctx.request;
        try {
            return await mappings.createMapping(body.data);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const updateMapping = async (ctx) => {
        const { body } = ctx.request;
        try {
            return await mappings.updateMapping(body.data);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const updateMappings = async (ctx) => {
        const { body } = ctx.request;
        try {
            return await mappings.updateMappings(body.data);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const detachMapping = async (ctx) => {
        const { body } = ctx.request;
        try {
            return await mappings.detachMapping(body.data.indexUUID, body.data.mappingUUID);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const deleteMapping = async (ctx) => {
        try {
            return await mappings.deleteMapping(ctx.params.mappingUUID);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    return {
        getMapping,
        getMappings,
        createMapping,
        updateMapping,
        updateMappings,
        deleteMapping,
        detachMapping
    };
};
