"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("../app.config"));
exports.default = async ({ strapi }) => {
    // TODO: Make a console wrapper function that uses a global plugin name at the start of each console message.
    const pluginConfigFile = await strapi.config.get('plugin.' + app_config_1.default.app_name);
    const pluginCore = strapi.plugins[app_config_1.default.app_name];
    const serviceGeneral = pluginCore.services.general;
    const serviceESInterface = pluginCore.services.esInterface;
    const servicePerformIndexing = pluginCore.services.performIndexing;
    try {
        await serviceGeneral.initializePlugin();
        const pluginInstanceCached = strapi[app_config_1.default.app_name + '_pluginCache'];
        // CHECK IF ES CONNECTION CONFIG EXISTS
        if (!Object.keys(pluginConfigFile).includes('connection')) {
            console.warn("ES PLUGIN - The plugin is enabled but the connection is not configured.");
        }
        else {
            // INITIALIZE ES CONNECTION
            const connector = pluginConfigFile['connection'];
            await serviceESInterface.ES_initialize({
                hostfull: connector.hostfull,
                host: connector.host,
                uname: connector.username,
                password: connector.password,
                cert: connector.certificate
            });
            // INITIALIZE CRON
            if (!pluginInstanceCached.settings.cronSchedule) {
                console.warn("ES PLUGIN - The plugin is enabled but the cron schedule is not configured.");
            }
            else {
                strapi.cron.add({
                    [app_config_1.default.app_name + '_cronIndexing']: {
                        options: {
                            rule: pluginConfigFile['cronSchedule']
                        },
                        task: async ({ strapi }) => {
                            try {
                                const pluginInstance = strapi[app_config_1.default.app_name + '_pluginCache'];
                                if (pluginInstance && pluginInstance.settings && pluginInstance.settings.settingIndexingEnabled && !pluginInstance.settings.settingInstantIndex) {
                                    await servicePerformIndexing.processPendingTasks();
                                }
                            }
                            catch (error) {
                                console.error("ES PLUGIN - Could not perform cron task", error);
                            }
                        }
                    }
                });
            }
        }
        // ============================
        // LIFECYCLES
        // ============================
        // TODO: type 'event' properly; perhaps see: https://stackoverflow.com/questions/78367179/is-it-possible-to-typesafe-strapi-v4-lifecycle-hooks
        strapi.db.lifecycles.subscribe(async (event) => {
            const pluginInstance = strapi[app_config_1.default.app_name + '_pluginCache'];
            if (pluginInstance.settings.settingIndexingEnabled)
                // ------------------------------
                // afterCreate / afterUpdate
                // ------------------------------
                if (event.action === 'afterCreate' || event.action === 'afterUpdate') {
                    try {
                        const contentTypesForIndexing = await strapi.plugins[app_config_1.default.app_name].services.indexes.getContentTypesForIndexing();
                        if (contentTypesForIndexing.includes(event.model.uid)) {
                            servicePerformIndexing.processStrapiAddUpdateEvent(event);
                            const ctx = strapi.requestContext.get();
                            ctx.response.body = { status: 'success', data: event.result };
                        }
                    }
                    catch (error) {
                        //ctx.throw(500, error)
                        console.error("ES PLUGIN - afterCreate/afterUpdate error: ", error);
                        throw (error);
                    }
                }
            // ------------------------------
            // afterCreateMany / afterUpdateMany
            // ------------------------------
            if (event.action === 'afterCreateMany' || event.action === 'afterUpdateMany') {
                try {
                    const contentTypesForIndexing = await strapi.plugins[app_config_1.default.app_name].services.indexes.getContentTypesForIndexing();
                    if (contentTypesForIndexing.includes(event.model.uid)) {
                        if (Object.keys(event.params.where.id).includes('$in')) {
                            const eventItems = event.params.where.id['$in'];
                            for (let k = 0; k < eventItems.length; k++) {
                                servicePerformIndexing.processStrapiAddUpdateEvent({
                                    model: event.model,
                                    result: {
                                        has_no_data: true,
                                        id: eventItems[k],
                                        publishedAt: event.params.data.publishedAt // TODO: Scrutinize this; is it the same publishedAt for all the records in a batch? Presumably yes... if each batch action deals with publishedAt.
                                    }
                                });
                            }
                        }
                        const ctx = strapi.requestContext.get();
                        ctx.response.body = { status: 'success', data: event.result };
                    }
                }
                catch (error) {
                    //ctx.throw(500, error)
                    console.log("ES PLUGIN - afterCreateMany / afterUpdateMany error: ", error);
                    throw error;
                }
            }
            // ------------------------------
            // afterDelete
            // ------------------------------
            if (event.action === 'afterDelete') {
                try {
                    const contentTypesForIndexing = await strapi.plugins[app_config_1.default.app_name].services.indexes.getContentTypesForIndexing();
                    if (contentTypesForIndexing.includes(event.model.uid)) {
                        servicePerformIndexing.processStrapiDeleteEvent(event);
                        const ctx = strapi.requestContext.get();
                        ctx.response.body = { status: 'success', data: event.result };
                    }
                }
                catch (error) {
                    //ctx.throw(500, error)
                    console.log("ES PLUGIN - afterDelete error: ", error);
                    throw error;
                }
            }
            // ------------------------------
            // afterDeleteMany
            // ------------------------------
            if (event.action === 'afterDeleteMany') {
                try {
                    const contentTypesForIndexing = await strapi.plugins[app_config_1.default.app_name].services.indexes.getContentTypesForIndexing();
                    if (contentTypesForIndexing.includes(event.model.uid)) {
                        if (Object.keys(event.params.where).includes('$and')
                            && Array.isArray(event.params.where['$and'])
                            && Object.keys(event.params.where['$and'][0]).includes('id')
                            && Object.keys(event.params.where['$and'][0]['id']).includes('$in')) {
                            const eventItems = event.params.where['$and'][0]['id']['$in'];
                            for (let k = 0; k < eventItems.length; k++) {
                                servicePerformIndexing.processStrapiDeleteEvent({
                                    model: event.model,
                                    result: {
                                        id: eventItems[k]
                                    }
                                });
                            }
                        }
                        const ctx = strapi.requestContext.get();
                        ctx.response.body = { status: 'success', data: event.result };
                    }
                }
                catch (error) {
                    //ctx.throw(500, error)
                    console.log("ES PLUGIN - afterDeleteMany error: ", error);
                    throw error;
                }
            }
        });
    }
    catch (error) {
        console.error('ES PLUGIN - An error encountered while initializing the plugin: ', error);
    }
};
