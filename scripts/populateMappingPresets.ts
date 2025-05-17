import { RegisteredIndex, Mapping, MappingField } from "../types"
import { removeUndefineds } from "."

export const populateMappingPresets = (mappings:Array<Mapping>, mapping:Mapping):Mapping => {
    if (mappings && mapping && mapping.fields) {
        for (let y = 0; y < Object.keys(mapping.fields).length; y++) {
            let field = mapping.fields[Object.keys(mapping.fields)[y]]
            if (field && field.preset_uuid) {
                let work = mappings.find( (x:Mapping) => x.uuid === field.preset_uuid)
                if (work) {
                    work = populateMappingPresets(mappings, work)
                    field['mapping'] = work
                }
            }
        }
    }
    return mapping
}