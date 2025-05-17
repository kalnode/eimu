"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => {
    const esInterface = strapi.plugins[app_config_1.default.app_name].services.esInterface;
    const getESIndexes = async (ctx) => {
        try {
            return await esInterface.ES_getIndexes();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const deleteIndex = async (ctx) => {
        try {
            return await esInterface.ES_deleteIndex(ctx.params.indexName);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const cloneIndex = async (ctx) => {
        const { body } = ctx.request;
        try {
            return await esInterface.ES_cloneIndex(body.data.indexName, body.data.targetName);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const reindexIndex = async (ctx) => {
        const { body } = ctx.request;
        try {
            return await esInterface.ES_reindexIndex(body.data.indexName, body.data.targetName);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    return {
        getESIndexes,
        deleteIndex,
        cloneIndex,
        reindexIndex
    };
};
