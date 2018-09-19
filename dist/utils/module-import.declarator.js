"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const path_solver_1 = require("./path.solver");
class ModuleImportDeclarator {
    constructor(solver = new path_solver_1.PathSolver()) {
        this.solver = solver;
    }
    declare(content, options) {
        const toInsert = this.buildLineToInsert(options);
        const importLines = this.findImports(content);
        const otherLines = this.findOtherLines(content, importLines);
        importLines.push(toInsert);
        return importLines.join('\n').concat(otherLines.join('\n'));
    }
    findImports(content) {
        return content.split('\n')
            .filter((line) => line.match(/import {/));
    }
    findOtherLines(content, importLines) {
        return content.split('\n')
            .filter((line) => importLines.indexOf(line) < 0);
    }
    buildLineToInsert(options) {
        return `import { ${options.symbol} } from '${this.computeRelativePath(options)}';\n`;
    }
    computeRelativePath(options) {
        let importModulePath;
        if (options.type !== undefined) {
            importModulePath = core_1.normalize(`/${options.path}/${options.name}.${options.type}`);
        }
        else {
            importModulePath = core_1.normalize(`/${options.path}/${options.name}`);
        }
        return this.solver.relative(options.module, importModulePath);
    }
}
exports.ModuleImportDeclarator = ModuleImportDeclarator;
