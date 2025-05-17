"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ strapi }) => {
    const helperService = strapi.plugins['eimu'].services.helper;
    const orphansFind = async (ctx) => {
        try {
            return await helperService.orphansFind();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const orphansDelete = async (ctx) => {
        try {
            return await helperService.orphansDelete();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    const getStrapiContentTypes = async (ctx) => {
        try {
            return await helperService.getStrapiContentTypes();
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    return {
        orphansFind,
        orphansDelete,
        getStrapiContentTypes
    };
};
