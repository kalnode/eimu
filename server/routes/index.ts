import indexes from "./indexes"
import mappings from "./mappings"
import performSearch from "./perform-search"
import logs from "./logs"
import general from "./general"
import esInterface from "./es-interface"
import performIndexing from "./perform-indexing"
import helper from "./helper"


export default {
    indexes: indexes,
    mappings: mappings,
    esInterface: esInterface,
    search: performSearch,
    logs: logs,
    general: general,
    performIndexing: performIndexing,
    helper: helper
}
