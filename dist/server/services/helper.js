"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scripts_1 = require("../../scripts");
require("@strapi/strapi");
const app_config_1 = __importDefault(require("../../app.config"));
//import type { contentTypes } from "@strapi/types/"
exports.default = ({ strapi }) => ({
    getPluginStore() {
        return strapi.store({
            environment: '',
            type: 'plugin',
            name: app_config_1.default.app_name // NOTE: Must match plugin name
        });
    },
    async getStrapiTypesForPlugin() {
        try {
            const contentTypes = strapi.contentTypes;
            // TODO: Use the below array in allowedContentTypes .filter(), instead of having so many "c.includes"
            const allowedContentTypesActual = ['api::', 'plugin::users-permissions.user'];
            const finalOutput = {};
            // LOOP THROUGH CONTENT TYPES
            // TODO: This for-loop plus consts seems pretty stupid. Find a more elegant way. Also can we not get the fucking types from Strapi types?
            for (let x = 0; x < Object.keys(contentTypes).length; x++) {
                //for (const [keyContentType, contentType] of Object.entries(contentTypes)) {
                const key_contentType = Object.keys(contentTypes)[x];
                const val_contentType = Object.values(contentTypes)[x];
                // Proceed if the content type is approved
                if (allowedContentTypesActual.some((t) => key_contentType.includes(t))) {
                    // const rawAttributes = contentTypes[allowedContentTypes[r]].attributes
                    // Filter out fields we don't want (fieldsToExclude)
                    // const filteredAttributes = Object.keys(rawAttributes).filter((i) => !fieldsToExclude.includes(i))
                    if (val_contentType && val_contentType.attributes) {
                        finalOutput[key_contentType] = {};
                        for (let r = 0; r < Object.keys(val_contentType.attributes).length; r++) {
                            //for (const [key_Attribute, val_Attribute] of Object.entries(val_contentType.attributes)) {
                            const key_attribute = Object.keys(val_contentType.attributes)[r];
                            const val_attribute = Object.values(val_contentType.attributes)[r];
                            // TODO: Why is all of this needed?
                            let attributeType = "regular";
                            if (val_attribute.type) {
                                // TODO: Scrutinize strapi field types "component" and "dynamiczone"
                                if (val_attribute.type === "component") {
                                    attributeType = "component";
                                }
                                else if (val_attribute.type === "dynamiczone") {
                                    attributeType = "dynamiczone";
                                }
                                else if (val_attribute.type === "relation") {
                                    attributeType = "relation";
                                }
                            }
                            finalOutput[key_contentType][key_attribute] = {
                                //type_strapi: '',
                                strapi_type: key_contentType,
                                raw_type: val_attribute.type,
                                field_type: attributeType,
                                whole_raw_object: val_attribute
                            };
                            // for (let k = 0; k < filteredAttributes.length; k++) {
                            //     const currentAttribute = filteredAttributes[k]
                            //     let attributeType = "regular"
                            //     if (typeof rawAttributes[currentAttribute]["type"] !== "undefined" && rawAttributes[currentAttribute]["type"] !== null) {
                            //         // TODO: Scrutinize strapi field types "component" and "dynamiczone"; I know nothing of them and how we'd want to handle them.
                            //         if (rawAttributes[currentAttribute]["type"] === "component") {
                            //             attributeType = "component"
                            //         } else if (rawAttributes[currentAttribute]["type"] === "dynamiczone") {
                            //             attributeType = "dynamiczone"
                            //         }
                            //     }
                            //     finalOutput[allowedContentTypes[r]][filteredAttributes[k]] = {
                            //         raw_type: rawAttributes[currentAttribute]["type"],
                            //         field_type: attributeType
                            //     }
                            // }
                        }
                    }
                }
            }
            return finalOutput;
        }
        catch (error) {
            console.error('SERVICE helper getStrapiTypesForPlugin - error:', error);
            throw error;
        }
    },
    // ====================================
    // ORPHANS
    // ====================================
    async orphansFind() {
        var _a;
        const esInterface = strapi.plugins[app_config_1.default.app_name].services.esInterface;
        let query = {
            query: {
                match_all: {}
            }
        };
        const resp = await esInterface.ES_searchData(query);
        if ((_a = resp === null || resp === void 0 ? void 0 : resp.hits) === null || _a === void 0 ? void 0 : _a.hits) {
            const filteredData = resp.hits.hits.filter((dt) => dt._source !== null);
            let results = {
                matched: 0,
                orphaned: 0
            };
            for (let i = 0; i < filteredData.length; i++) {
                const item = filteredData[i];
                const content_type = item._source.content_type;
                const id = await (0, scripts_1.getTypefromStrapiID)(item._id);
                const checkWork = await checkStrapiDBRecordExists(content_type, id);
                if (checkWork) {
                    results.matched = results.matched + 1;
                }
                else {
                    results.orphaned = results.orphaned + 1;
                }
            }
            return "Matched: " + results.matched + ", Orphaned: " + results.orphaned;
        }
        else {
            return 'No records exist!';
        }
    },
    async orphansDelete() {
        var _a;
        const esInterface = strapi.plugins[app_config_1.default.app_name].services.esInterface;
        let query = {
            query: {
                match_all: {}
            }
        };
        const resp = await esInterface.ES_searchData(query);
        if ((_a = resp === null || resp === void 0 ? void 0 : resp.hits) === null || _a === void 0 ? void 0 : _a.hits) {
            const filteredData = resp.hits.hits.filter((dt) => dt._source !== null);
            let results = {
                matched: 0,
                orphaned: 0,
                deleted: 0
            };
            for (let i = 0; i < filteredData.length; i++) {
                let item = filteredData[i];
                let content_type = item._source.content_type;
                let id = await (0, scripts_1.getTypefromStrapiID)(item._id);
                let checkWork = await checkStrapiDBRecordExists(content_type, id);
                if (checkWork) {
                    results.matched = results.matched + 1;
                }
                else {
                    results.orphaned = results.orphaned + 1;
                    const deleteWork = await esInterface.ES_removeItemFromIndex(item._id);
                    if (deleteWork) {
                        results.deleted = results.deleted + 1;
                    }
                }
            }
            return "Matched: " + results.matched + ", Orphaned: " + results.orphaned + ", Deleted: " + results.deleted;
        }
        else {
            return 'No records exist!';
        }
    }
});
const checkStrapiDBRecordExists = async (type, id) => {
    let typeFinal;
    // TODO: Need to do this check otherwise Strapi crashes if "api::something.something" doesn't exist. 
    // The "user" type is special in this regard. Barring an official typing here, we do this manual change.
    if (type === 'user') {
        typeFinal = 'plugin::users-permissions.user';
    }
    else {
        typeFinal = 'api::' + type + '.' + type;
    }
    const work = await strapi.entityService.findOne(typeFinal, id);
    // TODO: Just return the record, instead of boolean?
    if (work) {
        return true;
    }
    else {
        return false;
    }
};
