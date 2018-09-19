"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
class ModuleFinder {
    constructor(tree) {
        this.tree = tree;
    }
    find(options) {
        const generatedDirectoryPath = options.path;
        const generatedDirectory = this.tree.getDir(generatedDirectoryPath);
        return this.findIn(generatedDirectory);
    }
    findIn(directory) {
        if (!directory) {
            return null;
        }
        const moduleFilename = directory
            .subfiles
            .find((filename) => /\.module\.(t|j)s/.test(filename));
        return moduleFilename !== undefined ?
            core_1.join(directory.path, moduleFilename.valueOf())
            :
                this.findIn(directory.parent);
    }
}
exports.ModuleFinder = ModuleFinder;
