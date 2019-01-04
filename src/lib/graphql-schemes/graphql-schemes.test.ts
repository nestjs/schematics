import {
  SchematicTestRunner,
  UnitTestTree
} from "@angular-devkit/schematics/testing";
import * as path from "path";
import { GraphQLSchemeOptions } from "./graphql-schemes.scheme";

describe("GraphQL Schemes Generator", () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    ".",
    path.join(process.cwd(), "src/collection.json")
  );

  const findFiles = () => ["/foo.scheme.ts"];

  describe("Type definition", () => {
    it("should convert interface to GraphQL type", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `interface User {
          name: string;
          age: number;
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  name: String!\n  age: Int!\n}"
      );
    });
    it("should convert type alias to GraphQL type", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `type User = {
          name: string;
          age: number;
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  name: String!\n  age: Int!\n}"
      );
    });
    it("should convert class to GraphQL type", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `class User {
          name: string;
          age: number;
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  name: String!\n  age: Int!\n}"
      );
    });
    it("should convert enum to GraphQL enum", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `enum Role {
          ADMIN,
          MODERATOR,
          CLIENT
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "enum Role {\n  ADMIN\n  MODERATOR\n  CLIENT\n}"
      );
    });
    it("should convert union type alias to GraphQL union", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `type Article = string[] | string`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "union Article = [String!]! | String!"
      );
    });
    it("should convert any Query type definition to Query without fields", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `interface Query {
          age: number;
          name: string;
          getUserId(name: string): number;
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type Query {\n  getUserId(name: String!): Int!\n}"
      );
    });
    it("should convert any Mutation type definition to Mutation without fields", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `interface Mutation {
          age: number;
          name: string;
          updateUser(name: string): number;
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type Mutation {\n  updateUser(name: String!): Int!\n}"
      );
    });
    it("should convert any Mutation arguments type to GraphQL input", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `
          interface UserInput {
            name: string;
            id: ID;
          } 

          interface Mutation {
            updateUser(input: UserInput): number;
          }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "input UserInput {\n  name: String!\n  id: ID!\n}\n\ntype Mutation {\n  updateUser(input: UserInput!): Int!\n}"
      );
    });
    it("should generate scalar file for undeclarated type", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `
          interface User {
            name: string;
            birthday: Date;
          }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(
        files.find(filename => filename === "/scalars.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  name: String!\n  birthday: Date!\n}"
      );
      expect(tree.readContent("/scalars.graphql")).toEqual("scalar Date");
    });
  });
  describe("Field types", () => {
    it("should convert string to String GraphQL type", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `class User {
          name: string;
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  name: String!\n}"
      );
    });
    it("should convert boolean to Boolean GraphQL type", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `class User {
          isAdmin: boolean;
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  isAdmin: Boolean!\n}"
      );
    });
    it("should convert number to Int GraphQL type", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `class User {
          age: number;
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  age: Int!\n}"
      );
    });
    it("should convert nullable type to null GraphQL field", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `class User {
          age?: number;
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  age: Int\n}"
      );
    });
    it("should convert union type with null type to null GraphQL field", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `class User {
          age: number | null;
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  age: Int\n}"
      );
    });
    it("should convert array type to array GraphQL type", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `class User {
          friends: string[];
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  friends: [String!]!\n}"
      );
    });
    it("should convert generic array type to array GraphQL type", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `class User {
          friends: Array<string>;
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  friends: [String!]!\n}"
      );
    });
    it("should convert custom type to custom GraphQL type", () => {
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => `class User {
          bestFriend: User
        }`
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).toBeDefined();
      expect(tree.readContent("/foo.scheme.graphql")).toEqual(
        "type User {\n  bestFriend: User!\n}"
      );
    });
  });
  describe("Compilation errors", () => {
    it("should throw error for untyped arguments or return value for methods", () => {
      const error = jest.fn();
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => "interface User { getParens(); }",
        logger: { error, complete: jest.fn() }
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).not.toBeDefined();
      expect(error.mock.calls.length).toBe(1);
      expect(error.mock.calls[0][0]).toEqual(
        "/foo.scheme.ts(1,18): Method should not have untyped arguments or return"
      );
    });
    it("should throw error for computed properties", () => {
      const error = jest.fn();
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => "interface User { [2 + 3](); }",
        logger: { error, complete: jest.fn() }
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).not.toBeDefined();
      expect(error.mock.calls.length).toBe(1);
      expect(error.mock.calls[0][0]).toEqual(
        "/foo.scheme.ts(1,18): Can't work with computed property inside GraphQL Scheme"
      );
    });
    it("should throw error for object pattern properties", () => {
      const error = jest.fn();
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () =>
          "class User { getUser({ id }: ID): ID { return id; }; }",
        logger: { error, complete: jest.fn() }
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).not.toBeDefined();
      expect(error.mock.calls.length).toBe(1);
      expect(error.mock.calls[0][0]).toEqual(
        "/foo.scheme.ts(1,22): Can't work with any binding pattern"
      );
    });
    it("should throw error for array pattern properties", () => {
      const error = jest.fn();
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () =>
          "class User { getUser([ id ]: ID): ID { return id; }; }",
        logger: { error, complete: jest.fn() }
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).not.toBeDefined();
      expect(error.mock.calls.length).toBe(1);
      expect(error.mock.calls[0][0]).toEqual(
        "/foo.scheme.ts(1,22): Can't work with any binding pattern"
      );
    });
    it("should throw error for primitive type alias", () => {
      const error = jest.fn();
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => "type User = 2",
        logger: { error, complete: jest.fn() }
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).not.toBeDefined();
      expect(error.mock.calls.length).toBe(1);
      expect(error.mock.calls[0][0]).toEqual(
        "/foo.scheme.ts(1,1): Type declaration should be used only with object type literal"
      );
    });
    it("should throw error for expression inside default values", () => {
      const error = jest.fn();
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => "class User { getUser(id: number = a()): User }",
        logger: { error, complete: jest.fn() }
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).not.toBeDefined();
      expect(error.mock.calls.length).toBe(1);
      expect(error.mock.calls[0][0]).toEqual(
        "/foo.scheme.ts(1,35): Can't use expression as default value for GraphQL Scheme"
      );
    });
    it("should throw error for type literal inside object fields", () => {
      const error = jest.fn();
      const options: GraphQLSchemeOptions = {
        findFiles,
        readFile: () => "class User { a: 2 }",
        logger: { error, complete: jest.fn() }
      };
      const tree: UnitTestTree = runner.runSchematic(
        "graphql-schemes",
        options
      );
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === "/foo.scheme.graphql")
      ).not.toBeDefined();
      expect(error.mock.calls.length).toBe(1);
      expect(error.mock.calls[0][0]).toEqual(
        "/foo.scheme.ts(1,17): Type should be only primitives like number, string or boolean, or reference on existing type"
      );
    });
  });
});
