"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
class NameParser {
    constructor() { }
    parse(options) {
        const nameWithoutPath = core_1.basename(options.name);
        const namePath = core_1.dirname((options.path === undefined ? '' : options.path).concat('/').concat(options.name));
        return {
            name: nameWithoutPath,
            path: core_1.normalize('/'.concat(namePath)),
        };
    }
}
exports.NameParser = NameParser;
