import appConfig from "../../app.config"

export default ({ strapi }) => ({

    async addFullDBIndexingTask() {
        return await strapi.entityService.create('plugin::'+appConfig.app_name+'.task', {
            data: {
                content_type: '',
                indexing_type: 'add-to-index',
                indexing_status: 'to-be-done',
                full_db_indexing: true
            }
        })
    },

    async addContentTypeToIndex(params: { contentTypeUid:string, indexUUID:string }) {
        return await strapi.entityService.create('plugin::'+appConfig.app_name+'.task', {
            data: {
                index_uuid: params.indexUUID,
                content_type: params.contentTypeUid,
                indexing_type: 'add-to-index',
                indexing_status: 'to-be-done'
            }
        })
    },

    async addOrUpdateItemToIndex(indexUUID:string, content_type:string, record_id:string) {
        return await strapi.entityService.create('plugin::'+appConfig.app_name+'.task', {
            data: {
                index_uuid: indexUUID,
                content_type: content_type,
                record_id: record_id,
                indexing_type: 'add-to-index',
                indexing_status: 'to-be-done'
            }
        })
    },

    async removeItemFromIndex(params: { contentTypeUid:string, recordId:string, indexUUID?:string }) {
        return await strapi.entityService.create('plugin::'+appConfig.app_name+'.task', {
            data: {
                index_uuid: params.indexUUID,
                item_id: params.recordId, 
                content_type: params.contentTypeUid,
                indexing_type: 'remove-from-index',
                indexing_status: 'to-be-done'
            }
        })
    },

    async getItemsPendingToBeIndexed() {
        return await strapi.entityService.findMany('plugin::'+appConfig.app_name+'.task', {
            filters: {
                indexing_status: 'to-be-done'
            }
        })
    },

    async markIndexingTaskComplete(taskId:string) {
        return await strapi.entityService.update('plugin::'+appConfig.app_name+'.task', taskId, {
            data: {
                'indexing_status': 'done'
            }
        })
    }

})