"use strict";
// TODO: Ideally we load this, but this seems to break type generation in parent project Strapi root
//const helper = strapi.plugins['eimu'].services.helper
Object.defineProperty(exports, "__esModule", { value: true });
// ERROR:
// > strapi ts:generate-types
// Error: Could not load js config file /Users/kal/Projects/sportpost/socialmeet/src/plugins/eimu/strapi-server.js: Cannot read properties of undefined (reading 'services')
//     at loadJsFile (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/core/app-configuration/load-config-file.js:18:13)
//     at Module.loadFile (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/core/app-configuration/load-config-file.js:37:14)
//     at Object.loadPlugins (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/core/loaders/plugins/index.js:90:41)
//     at async Strapi.loadPlugins (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/Strapi.js:311:5)
//     at async Promise.all (index 3)
//     at async Strapi.register (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/Strapi.js:341:5)
//     at async action (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/commands/actions/ts/generate-types/action.js:12:15)
//  *  The terminal process "/bin/zsh '-c', 'npm run 'strapi gen typings''" terminated with exit code: 1. 
//  *  Terminal will be reused by tasks, press any key to close it. 
exports.default = ({ strapi }) => ({
    // FOR NOW: We define duplicate function here, and project does not fail:
    helperGetPluginStore() {
        return strapi.store({
            environment: '',
            type: 'plugin',
            name: 'eimu'
        });
    },
    isInitialized() {
        var _a;
        return ((_a = strapi.espluginCache) === null || _a === void 0 ? void 0 : _a.initialized) || false;
    },
    async initializeESPlugin() {
        try {
            if (!strapi.espluginCache) {
                strapi.espluginCache = {};
            }
            // TODO: Keep for now to support legacy; delete later
            //strapi.espluginCache.collections = await this.getCollectionsConfiguredForIndexing()
            // Plugin settings
            const pluginStore = this.helperGetPluginStore();
            //const settings:any = await pluginStore.get({ key: 'configsettings' })
            //strapi.espluginCache.settings = settings
            // Mappings
            const mappingsService = await strapi.plugins['eimu'].services.mappings;
            strapi.espluginCache.mappings = await mappingsService.getMappings();
            // Indexes
            const indexingService = await strapi.plugins['eimu'].services.indexes;
            strapi.espluginCache.indexes = await indexingService.getIndexes();
            // TODO: Maybe not needed because we have "mappings" stored above, but keeping for convenience
            //strapi.espluginCache.posttypes = await pluginStore.NEWgetPostTypesForIndexing()
            const settings = JSON.parse(await pluginStore.get({ key: 'configsettings' }));
            if (settings) {
                //return settings
                //return await pluginStore.set({ key: 'configsettings', value: null})
            }
            else {
                // TODO: Put store defaults here
                const newSettings = JSON.stringify({});
                await pluginStore.set({ key: 'configsettings', value: newSettings });
            }
            strapi.espluginCache.initialized = true;
            // TODO: Is any of this actually working?
            // TODO: Move these into settings child object, otherwise these toggles all re-toggle on every re-boot !!!!!!!!
            if (!strapi.espluginCache.settingIndexingEnabled) {
                strapi.espluginCache.settingIndexingEnabled = true;
            }
            if (!strapi.espluginCache.settingInstantIndex) {
                strapi.espluginCache.settingInstantIndex = true;
            }
            if (!strapi.espluginCache.useNewPluginParadigm) {
                strapi.espluginCache.useNewPluginParadigm = true;
            }
        }
        catch (error) {
            console.log("Error initializing plugin", error);
        }
    }
});
