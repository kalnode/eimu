"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateMappingPresets = void 0;
const populateMappingPresets = (mappings, mapping) => {
    if (mappings && mapping && mapping.fields) {
        for (let y = 0; y < Object.keys(mapping.fields).length; y++) {
            let field = mapping.fields[Object.keys(mapping.fields)[y]];
            if (field && field.preset_uuid) {
                let work = mappings.find((x) => x.uuid === field.preset_uuid);
                if (work) {
                    work = (0, exports.populateMappingPresets)(mappings, work);
                    field['mapping'] = work;
                }
            }
        }
    }
    return mapping;
};
exports.populateMappingPresets = populateMappingPresets;
