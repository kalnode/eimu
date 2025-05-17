import { apiDeleteMapping, apiDetachMappingFromIndex } from '../apiUrls'
import { convertEmptyStringsToNulls } from '../convertEmptyStringsToNulls'
import axiosInstance from '../axiosInstance'

import { Mapping } from "../../../../types"

export const requestAPI_DeleteMapping = async (mapping:Mapping, indexUUID?:string) => {

    try {
        if (mapping) {
            // IF INDEXUUID, JUST DETACH MAPPING FROM INDEX
            // Use case: A preset mapping applied to an index may be a "preset" mapping that the user would want to maintain for future use.
            if (indexUUID && mapping.preset) {
                return await axiosInstance.post(apiDetachMappingFromIndex, {
                    data: { mappingUUID: mapping.uuid, indexUUID: indexUUID }
                })

            // ALL OTHER CASES, ACTUALLY DELETE MAPPING
            } else if (mapping.uuid) {
                return await axiosInstance.get(apiDeleteMapping(mapping.uuid))
            }
        }
    } catch (error) {
        console.error('requestAPI_DeleteMapping error occurred', error)
        throw error
    }

    
}