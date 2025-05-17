"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUndefineds = void 0;
const removeUndefineds = (anObject) => {
    // TODO: Fix this type warning
    Object.keys(anObject).forEach(key => anObject[key] === undefined && delete anObject[key]);
};
exports.removeUndefineds = removeUndefineds;
