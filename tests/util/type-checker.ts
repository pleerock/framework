import * as ts from "typescript";

interface DocEntry {
    name: string;
    type: string;
}

/** Generate documentation for all classes in a set of .ts files */
export function getTypes(
    fileNames: string[],
    options: ts.CompilerOptions = {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS
    }
): { name: string, type: string }[] {
    // Build a program using the set of root file names in fileNames
    let program = ts.createProgram(fileNames, options);

    // Get the checker, we will use it to find more about classes
    let checker = program.getTypeChecker();

    let output: DocEntry[] = [];

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
        if (fileNames.indexOf(sourceFile.fileName) !== -1) {
            if (!sourceFile.isDeclarationFile) {
                // Walk the tree to search for classes
                ts.forEachChild(sourceFile, visit);
            }
        }
    }

    // print out the doc
    // console.log(JSON.stringify(output, undefined, 4))

    return output

    /** visit nodes finding exported classes */
    function visit(node: ts.Node) {
        // Only consider exported nodes
        if (!isNodeExported(node)) {
            return;
        }

        if (ts.isTypeAliasDeclaration(node) && node.name) {
            // This is a top level class, get its symbol
            let symbol = checker.getSymbolAtLocation(node.name);
            if (symbol) {
                output.push({
                    name: symbol.getName(),
                    type: checker.typeToString(
                        checker.getDeclaredTypeOfSymbol(symbol)
                    )
                });
            }
            // No need to walk any further, class expressions/inner declarations
            // cannot be exported
        }
    }

    /** True if this is visible outside this file, false otherwise */
    function isNodeExported(node: ts.Node): boolean {
        return (
            (ts.ModifierFlags.Export) !== 0 ||
            (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
        );
    }
}
