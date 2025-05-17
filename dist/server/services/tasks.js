"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("../../app.config"));
exports.default = ({ strapi }) => ({
    async addFullDBIndexingTask() {
        return await strapi.entityService.create('plugin::' + app_config_1.default.app_name + '.task', {
            data: {
                content_type: '',
                indexing_type: 'add-to-index',
                indexing_status: 'to-be-done',
                full_db_indexing: true
            }
        });
    },
    async addContentTypeToIndex(params) {
        return await strapi.entityService.create('plugin::' + app_config_1.default.app_name + '.task', {
            data: {
                index_uuid: params.indexUUID,
                content_type: params.contentTypeUid,
                indexing_type: 'add-to-index',
                indexing_status: 'to-be-done'
            }
        });
    },
    async addOrUpdateItemToIndex(indexUUID, content_type, record_id) {
        return await strapi.entityService.create('plugin::' + app_config_1.default.app_name + '.task', {
            data: {
                index_uuid: indexUUID,
                content_type: content_type,
                record_id: record_id,
                indexing_type: 'add-to-index',
                indexing_status: 'to-be-done'
            }
        });
    },
    async removeItemFromIndex(params) {
        return await strapi.entityService.create('plugin::' + app_config_1.default.app_name + '.task', {
            data: {
                index_uuid: params.indexUUID,
                item_id: params.recordId,
                content_type: params.contentTypeUid,
                indexing_type: 'remove-from-index',
                indexing_status: 'to-be-done'
            }
        });
    },
    async getItemsPendingToBeIndexed() {
        return await strapi.entityService.findMany('plugin::' + app_config_1.default.app_name + '.task', {
            filters: {
                indexing_status: 'to-be-done'
            }
        });
    },
    async markIndexingTaskComplete(taskId) {
        return await strapi.entityService.update('plugin::' + app_config_1.default.app_name + '.task', taskId, {
            data: {
                'indexing_status': 'done'
            }
        });
    }
});
