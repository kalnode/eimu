import { apiUpdateIndex } from '../apiUrls'
import { convertEmptyStringsToNulls } from '../convertEmptyStringsToNulls'
import axiosInstance from '../axiosInstance'

import { RegisteredIndex } from "../../../../types"

export const requestUpdateIndex = async (indexUUID:string, payload:Partial<RegisteredIndex>) => {

    let payloadFinal = payload

    // TODO: Do we need to do any of this anymore?
    //delete payload.mappings
    //delete payloadFinal.createdAt
    //delete payloadFinal.updatedAt
    //payloadFinal = convertEmptyStringsToNulls(payloadFinal)
    //console.log("requestUpdateIndex: payload", payloadFinal)

    return await axiosInstance.post(apiUpdateIndex(indexUUID), {
        data: payloadFinal
    })
    .then( (response) => {
        console.log("requestUpdateIndex: response", response)
        if (response.data) {
            return response.data
        }
    })
    .catch((error) => {
        console.log("requestUpdateIndex ERROR: ", error)
        throw error
    })

}