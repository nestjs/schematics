"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const module_declarator_1 = require("../../utils/module.declarator");
const module_finder_1 = require("../../utils/module.finder");
const name_parser_1 = require("../../utils/name.parser");
const defaults_1 = require("../defaults");
function main(options) {
    options = transform(options);
    return (tree, context) => {
        return schematics_1.branchAndMerge(schematics_1.chain([addDeclarationToModule(options), schematics_1.mergeWith(generate(options))]))(tree, context);
    };
}
exports.main = main;
function transform(source) {
    const target = Object.assign({}, source);
    target.metadata = 'imports';
    target.type = 'module';
    const defaultSourceRoot = source.sourceRoot !== undefined ? source.sourceRoot : defaults_1.DEFAULT_PATH_NAME;
    target.path =
        target.path !== undefined
            ? core_1.join(core_1.normalize(defaultSourceRoot), target.path)
            : core_1.normalize(defaultSourceRoot);
    const location = new name_parser_1.NameParser().parse(target);
    target.name = core_1.strings.dasherize(location.name);
    target.path = core_1.join(core_1.strings.dasherize(location.path), target.name);
    target.language = target.language !== undefined ? target.language : 'ts';
    return target;
}
function generate(options) {
    return schematics_1.apply(schematics_1.url(core_1.join('../../templates', options.language, 'module')), [
        schematics_1.template(Object.assign({}, core_1.strings, options)),
        schematics_1.move(options.path),
    ]);
}
function addDeclarationToModule(options) {
    return (tree) => {
        if (options.skipImport !== undefined && options.skipImport) {
            return tree;
        }
        options.module = new module_finder_1.ModuleFinder(tree).find({
            name: options.name,
            path: options.path,
        });
        if (!options.module) {
            return tree;
        }
        const content = tree.read(options.module).toString();
        const declarator = new module_declarator_1.ModuleDeclarator();
        tree.overwrite(options.module, declarator.declare(content, options));
        return tree;
    };
}
