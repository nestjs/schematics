import * as ts from "typescript";

interface UnionDeclaration extends ts.TypeAliasDeclaration {
  type: ts.UnionTypeNode;
}
type TypeDeclarationNode =
  | ts.InterfaceDeclaration
  | ts.ClassDeclaration
  | ts.TypeAliasDeclaration;

type GhraphQLItemDeclarationNode =
  | TypeDeclarationNode
  | UnionDeclaration
  | ts.EnumDeclaration;

export interface GraphQLSchemeItem {
  name: string;
  scheme: string;
}

export class CompilerError extends Error {
  constructor(
    public message: string,
    public line: number,
    public column: number
  ) {
    super(message);
  }
}

interface GhraphQLTranspileResult {
  types: GraphQLSchemeItem[];
  errors: CompilerError[];
}

export class NodeError extends Error {
  constructor(public message: string, public node: ts.Node) {
    super(message);
  }
}

function isTypeDeclaration(
  statement: ts.Node
): statement is TypeDeclarationNode {
  return (
    statement.kind === ts.SyntaxKind.InterfaceDeclaration ||
    statement.kind === ts.SyntaxKind.ClassDeclaration ||
    statement.kind === ts.SyntaxKind.TypeAliasDeclaration
  );
}

function isUnionTypeDeclaration(
  statement: ts.Node
): statement is UnionDeclaration {
  return (
    ts.isTypeAliasDeclaration(statement) &&
    statement.type.kind === ts.SyntaxKind.UnionType
  );
}

function isGraphQLDeclaration(
  statement: ts.Node
): statement is GhraphQLItemDeclarationNode {
  return (
    isTypeDeclaration(statement) ||
    ts.isEnumDeclaration(statement) ||
    isUnionTypeDeclaration(statement)
  );
}

function isNull(type: ts.TypeNode): type is ts.NullLiteral {
  return type.kind === ts.SyntaxKind.NullKeyword;
}

function isMethod(
  property: ts.ClassElement | ts.TypeElement
): property is ts.MethodSignature | ts.MethodDeclaration {
  return (
    property.kind === ts.SyntaxKind.MethodDeclaration ||
    property.kind === ts.SyntaxKind.MethodSignature
  );
}

function isProperty(
  property: ts.ClassElement | ts.TypeElement
): property is ts.PropertyDeclaration | ts.PropertySignature {
  return (
    property.kind === ts.SyntaxKind.PropertyDeclaration ||
    property.kind === ts.SyntaxKind.PropertySignature
  );
}

function isTrueLiteral(literal: ts.Expression): boolean {
  return literal.kind === ts.SyntaxKind.TrueKeyword;
}

function isFalseLiteral(literal: ts.Expression): boolean {
  return literal.kind === ts.SyntaxKind.FalseKeyword;
}

function not(predicate: (...args) => boolean): (...args) => boolean {
  return (...args) => !predicate(...args);
}

function getDeclarationName(declaration: GhraphQLItemDeclarationNode): string {
  return declaration.name.text;
}

function getPropertyType(
  type: ts.TypeNode,
  scalarCandidatesContainer: Set<string>,
  isStrict: boolean = true
): string {
  let propertyType: string = "";
  switch (type.kind) {
    case ts.SyntaxKind.ParenthesizedType:
      propertyType = getPropertyType(
        (type as ts.ParenthesizedTypeNode).type,
        scalarCandidatesContainer
      );
      break;
    case ts.SyntaxKind.BooleanKeyword:
      propertyType = "Boolean";
      break;
    case ts.SyntaxKind.StringKeyword:
      propertyType = "String";
      break;
    case ts.SyntaxKind.NumberKeyword:
      propertyType = "Int";
      break;
    case ts.SyntaxKind.ArrayType:
      propertyType = `[${getPropertyType(
        (type as ts.ArrayTypeNode).elementType,
        scalarCandidatesContainer
      )}]`;
      break;
    case ts.SyntaxKind.UnionType:
      const { types } = type as ts.UnionTypeNode;
      isStrict = types.find(isNull) === null;
      propertyType = getPropertyType(
        types.find(not(isNull)),
        scalarCandidatesContainer,
        isStrict
      );
      break;
    case ts.SyntaxKind.TypeReference:
      const identifier = (type as ts.TypeReferenceNode).typeName;
      if (!ts.isIdentifier(identifier)) {
        throw new NodeError("Property name should be only identifier", type);
      }
      const isArray = identifier.text === "Array";
      propertyType = isArray
        ? `[${getPropertyType(
            (type as ts.TypeReferenceNode).typeArguments[0],
            scalarCandidatesContainer
          )}]`
        : identifier.text;
      if (!isArray) {
        scalarCandidatesContainer.add(identifier.text);
      }
      break;
    default:
      throw new NodeError(
        "Type should be only primitives like number, string or boolean, or reference on existing type",
        type
      );
  }
  return `${propertyType}${isStrict ? "!" : ""}`;
}

function getDefaultValue(initializer: ts.Expression): string {
  if (ts.isStringLiteral(initializer)) {
    return `"${initializer.text}"`;
  }
  if (ts.isNumericLiteral(initializer)) {
    return initializer.text;
  }
  if (isTrueLiteral(initializer)) {
    return "true";
  }
  if (isFalseLiteral(initializer)) {
    return "false";
  }
  if (ts.isIdentifier(initializer)) {
    return initializer.text;
  }
  throw new NodeError(
    "Can't use expression as default value for GraphQL Scheme",
    initializer
  );
}

function getPropertyFrom(
  property:
    | ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.ParameterDeclaration,
  scalarCandidatesContainer: Set<string>
): string {
  const { name } = property;
  if (ts.isComputedPropertyName(name)) {
    throw new NodeError(
      "Can't work with computed property inside GraphQL Scheme",
      name
    );
  }
  if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    throw new NodeError("Can't work with any binding pattern", name);
  }
  const type = getPropertyType(
    property.type,
    scalarCandidatesContainer,
    property.questionToken === undefined && property.initializer === undefined
  );
  return `${name.text}: ${type}${
    property.initializer !== undefined
      ? ` = ${getDefaultValue(property.initializer)}`
      : ""
  }`;
}

function getMethodFrom(
  method: ts.MethodDeclaration | ts.MethodSignature,
  scalarCandidatesContainer: Set<string>
): string {
  if (ts.isComputedPropertyName(method.name)) {
    throw new NodeError(
      "Can't work with computed property inside GraphQL Scheme",
      method.name
    );
  }
  if (!method.type || method.parameters.find(p => !p.type)) {
    throw new NodeError(
      "Method should not have untyped arguments or return",
      method
    );
  }
  return `${method.name.text}(${method.parameters.reduce(
    (res, param, index) =>
      `${res}${index ? ", " : ""}${getPropertyFrom(
        param,
        scalarCandidatesContainer
      )}`,
    ""
  )}): ${getPropertyType(method.type, scalarCandidatesContainer)}`;
}

function getTypeFields(
  declaration: TypeDeclarationNode
): ts.NodeArray<ts.TypeElement | ts.ClassElement> {
  if (declaration.kind === ts.SyntaxKind.TypeAliasDeclaration) {
    if (declaration.type.kind !== ts.SyntaxKind.TypeLiteral) {
      throw new NodeError(
        "Type declaration should be used only with object type literal",
        declaration
      );
    }
    return (declaration.type as ts.TypeLiteralNode).members;
  } else {
    return declaration.members;
  }
}

function createEnumFrom(enumDeclaration: ts.EnumDeclaration): string {
  return `enum ${getDeclarationName(
    enumDeclaration
  )} {${enumDeclaration.members.reduce((res, member) => {
    if (ts.isComputedPropertyName(member.name)) {
      throw new NodeError(
        "Can't work with computed property inside GraphQL Scheme",
        member.name
      );
    }
    return `${res}\n  ${member.name.text}`;
  }, "")}
}`;
}

function createUnionFrom(
  declaration: UnionDeclaration,
  scalarCandidatesContainer: Set<string>
) {
  return `union ${getDeclarationName(
    declaration
  )} =${declaration.type.types.reduce(
    (res, type, index) =>
      `${res}${index ? " |" : ""} ${getPropertyType(
        type,
        scalarCandidatesContainer
      )}`,
    ""
  )}`;
}

function createTypeFrom(
  declaration: TypeDeclarationNode,
  scalarCandidatesContainer: Set<string>
): string {
  return `type ${getDeclarationName(declaration)} {${getTypeFields(
    declaration
  ).reduce((res, field) => {
    if (!isMethod(field) && !isProperty(field)) {
      return res;
    }
    return `${res}\n  ${
      isMethod(field)
        ? getMethodFrom(field, scalarCandidatesContainer)
        : getPropertyFrom(field, scalarCandidatesContainer)
    }`;
  }, "")}
}`;
}

function createInputFrom(
  declaration: TypeDeclarationNode,
  scalarCandidatesContainer: Set<string>
): string {
  return `input ${getDeclarationName(declaration)} {${getTypeFields(
    declaration
  ).reduce((res, field) => {
    if (!isProperty(field)) {
      return res;
    }
    return `${res}\n  ${getPropertyFrom(field, scalarCandidatesContainer)}`;
  }, "")}
}`;
}

function createQueryFrom(
  declaration: TypeDeclarationNode,
  scalarCandidatesContainer: Set<string>
): string {
  return `type Query {${getTypeFields(declaration).reduce((res, field) => {
    if (!isMethod(field)) {
      return res;
    }
    return `${res}\n  ${getMethodFrom(field, scalarCandidatesContainer)}`;
  }, "")}
}`;
}

function createMutationFrom(
  declaration: TypeDeclarationNode,
  scalarCandidatesContainer: Set<string>
): string {
  return `type Mutation {${getTypeFields(declaration).reduce((res, field) => {
    if (!isMethod(field)) {
      return res;
    }
    return `${res}\n  ${getMethodFrom(field, scalarCandidatesContainer)}`;
  }, "")}
}`;
}

export function createScalarsFrom(scalars: Set<string>): string {
  let scheme = "";
  scalars.forEach(scalarName => {
    scheme = `${scheme}${scheme ? "\n\n" : ""}scalar ${scalarName}`;
  });
  return scheme;
}

function getIdentifiersOfPotentialInputs(
  Mutation: TypeDeclarationNode
): Set<string> {
  return getTypeFields(Mutation).reduce((identifiers, property) => {
    if (!isMethod(property)) {
      return identifiers;
    }
    return property.parameters.reduce((res, parameter) => {
      if (
        !ts.isTypeReferenceNode(parameter.type) ||
        !ts.isIdentifier(parameter.type.typeName)
      ) {
        return res;
      }
      return res.add(parameter.type.typeName.text);
    }, identifiers);
  }, new Set());
}

function createGraphQlSchemeItem(
  factory: (a: GhraphQLItemDeclarationNode, b: Set<string>) => string,
  node: ts.Node,
  scalarCandidatesContainer: Set<string>
): GraphQLSchemeItem {
  return {
    name: getDeclarationName(node as GhraphQLItemDeclarationNode),
    scheme: factory(
      node as GhraphQLItemDeclarationNode,
      scalarCandidatesContainer
    )
  };
}

function transpileToScheme(
  node: ts.Node,
  inputIdentifiers: Set<string>,
  scalarCandidatesContainer: Set<string>
): GraphQLSchemeItem | null {
  switch (node.kind) {
    case ts.SyntaxKind.EnumDeclaration:
      return createGraphQlSchemeItem(
        createEnumFrom,
        node,
        scalarCandidatesContainer
      );
    case ts.SyntaxKind.TypeAliasDeclaration:
      if (ts.isUnionTypeNode((node as ts.TypeAliasDeclaration).type)) {
        return createGraphQlSchemeItem(
          createUnionFrom,
          node,
          scalarCandidatesContainer
        );
      }
    case ts.SyntaxKind.InterfaceDeclaration:
    case ts.SyntaxKind.ClassDeclaration:
      if ((node as TypeDeclarationNode).name.text === "Mutation") {
        return createGraphQlSchemeItem(
          createMutationFrom,
          node,
          scalarCandidatesContainer
        );
      }
      if ((node as TypeDeclarationNode).name.text === "Query") {
        return createGraphQlSchemeItem(
          createQueryFrom,
          node,
          scalarCandidatesContainer
        );
      }
      return createGraphQlSchemeItem(
        inputIdentifiers.has((node as TypeDeclarationNode).name.text)
          ? createInputFrom
          : createTypeFrom,
        node,
        scalarCandidatesContainer
      );
  }
  return null;
}

export function transpileToGQL(
  sourceFile: ts.SourceFile,
  scalarCandidatesContainer: Set<string>
): GhraphQLTranspileResult {
  const Mutation = sourceFile.statements.find(
    statement =>
      isTypeDeclaration(statement) && statement.name.text === "Mutation"
  );
  const inputIdentifiers = Mutation
    ? getIdentifiersOfPotentialInputs(Mutation as TypeDeclarationNode)
    : new Set();
  const errors = [];
  const types = sourceFile.statements.reduce((res, statement) => {
    try {
      const scheme = transpileToScheme(
        statement,
        inputIdentifiers,
        scalarCandidatesContainer
      );
      if (!scheme) {
        return res;
      }
      return res.concat([scheme]);
    } catch (e) {
      if (!(e instanceof NodeError)) {
        throw e;
      }
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        e.node.getStart(sourceFile)
      );
      errors.push(new CompilerError(e.message, line + 1, character + 1));
    }
  }, []);
  return {
    types,
    errors
  };
}
