"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_to_txt_1 = require("markdown-to-txt");
function transformMarkdownToText(md) {
    let text = md;
    try {
        text = (0, markdown_to_txt_1.markdownToTxt)(md);
    }
    catch (error) {
        console.error('ES transformMarkdownToText: Error while transforming markdown to text.');
        console.error(error);
    }
    return text;
}
const transformContent = ({ content, from }) => {
    if (from === 'markdown') {
        return transformMarkdownToText(content);
    }
    else {
        return from;
    }
};
exports.default = transformContent;
