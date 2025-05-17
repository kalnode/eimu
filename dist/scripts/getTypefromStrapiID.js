"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypefromStrapiID = void 0;
const getTypefromStrapiID = (strapiID) => {
    // TODO: Do we need this? Is there a better way; just doing this for now.
    return strapiID.split('.').slice(-1)[0];
};
exports.getTypefromStrapiID = getTypefromStrapiID;
