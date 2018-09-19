"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metadata_manager_1 = require("./metadata.manager");
class ModuleMetadataDeclarator {
    declare(content, options) {
        const manager = new metadata_manager_1.MetadataManager(content);
        const inserted = manager.insert(options.metadata, options.symbol);
        return inserted;
    }
}
exports.ModuleMetadataDeclarator = ModuleMetadataDeclarator;
