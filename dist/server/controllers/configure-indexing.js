"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ strapi }) => {
    const configureIndexingService = strapi.plugins['eimu'].services.configureIndexing;
    const getCollectionConfig = async (ctx) => {
        if (ctx.params.collectionname) {
            return configureIndexingService.getCollectionConfig({ collectionName: ctx.params.collectionname });
        }
        else {
            return null;
        }
    };
    const saveCollectionConfig = async (ctx) => {
        const { body } = ctx.request;
        try {
            const updatedConfig = await configureIndexingService.setContentConfig({ collection: ctx.params.collectionname, config: body.data });
            return updatedConfig;
        }
        catch (error) {
            ctx.throw(500, error);
        }
    };
    return {
        saveCollectionConfig
    };
};
