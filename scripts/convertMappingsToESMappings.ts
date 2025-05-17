import { RegisteredIndex, Mapping, MappingField } from "../types"
import { removeUndefineds } from "."
import { getTypefromStrapiID } from './getTypefromStrapiID'

export const convertMappingsToESMappings = (mappings:Array<Mapping>):MappingField => {
    let mappingFieldsFinal:any = {}

    if (mappings && mappings.length > 0) {
        for (let i = 0; i < mappings.length; i++) {
            let mapping:Mapping = mappings[i]
            let objectWork = processFields(mapping)
            mappingFieldsFinal = {...mappingFieldsFinal, ...objectWork}
        }

    }

    return mappingFieldsFinal

}

const processFields = (mapping:Mapping):any => {

    let finalObject:any = {}

    if (mapping.fields) {
        for (const [key, value] of Object.entries(mapping.fields)) {

            if (value.active) {

                if (value.mapping) {
                    finalObject[key] = {
                        type: value.type,
                        index: value.index,
                        properties: processFields(value.mapping)
                    }
                } else {
                    finalObject[key] = {
                        type: value.type,
                        index: value.index
                    }
                }

                // TODO: Is this needed?
                removeUndefineds(finalObject[key])
            }

        }
    }

    return finalObject
}