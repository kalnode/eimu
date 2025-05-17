"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tasks_1 = __importDefault(require("./tasks"));
const indexing_logs_1 = __importDefault(require("./indexing-logs"));
exports.default = {
    'task': { schema: tasks_1.default },
    'indexing-log': { schema: indexing_logs_1.default }
};
