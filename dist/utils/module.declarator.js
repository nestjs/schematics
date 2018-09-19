"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strings_1 = require("@angular-devkit/core/src/utils/strings");
const module_import_declarator_1 = require("./module-import.declarator");
const module_metadata_declarator_1 = require("./module-metadata.declarator");
class ModuleDeclarator {
    constructor(imports = new module_import_declarator_1.ModuleImportDeclarator(), metadata = new module_metadata_declarator_1.ModuleMetadataDeclarator()) {
        this.imports = imports;
        this.metadata = metadata;
    }
    declare(content, options) {
        options = this.computeSymbol(options);
        content = this.imports.declare(content, options);
        content = this.metadata.declare(content, options);
        return content;
    }
    computeSymbol(options) {
        const target = Object.assign({}, options);
        if (options.type !== undefined) {
            target.symbol = strings_1.classify(options.name).concat(strings_1.capitalize(options.type));
        }
        else {
            target.symbol = strings_1.classify(options.name);
        }
        return target;
    }
}
exports.ModuleDeclarator = ModuleDeclarator;
