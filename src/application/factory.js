"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
function main(options) {
    return schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./files'), [
        schematics_1.template(Object.assign({ classify: core_1.classify }, options))
    ]));
}
exports.main = main;
