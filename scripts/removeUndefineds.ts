export const removeUndefineds = (anObject:object) => {
    // TODO: Fix this type warning
    Object.keys(anObject).forEach(key => anObject[key] === undefined && delete anObject[key])
}