export const convertEmptyStringsToNulls = (object) => {
    return Object.keys(object).reduce((acc, key) => {
        acc[key] = object[key] === '' ? null : object[key]
        return acc
    }, {})
}