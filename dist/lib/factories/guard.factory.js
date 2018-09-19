"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const name_parser_1 = require("../../utils/name.parser");
const defaults_1 = require("../defaults");
function main(options) {
    options = transform(options);
    return schematics_1.mergeWith(generate(options));
}
exports.main = main;
function transform(options) {
    const target = Object.assign({}, options);
    const defaultSourceRoot = options.sourceRoot !== undefined ? options.sourceRoot : defaults_1.DEFAULT_PATH_NAME;
    target.path =
        target.path !== undefined
            ? core_1.join(core_1.normalize(defaultSourceRoot), target.path)
            : core_1.normalize(defaultSourceRoot);
    const location = new name_parser_1.NameParser().parse(target);
    target.name = core_1.strings.dasherize(location.name);
    target.path = core_1.strings.dasherize(location.path);
    target.language = target.language !== undefined ? target.language : 'ts';
    return target;
}
function generate(options) {
    return schematics_1.apply(schematics_1.url(core_1.join('../../templates', options.language, 'guard')), [
        schematics_1.template(Object.assign({}, core_1.strings, options)),
        schematics_1.move(options.path),
    ]);
}
