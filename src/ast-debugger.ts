import {
  Node,
  BinaryExpression,
  Literal,
  AST,
  UnaryExpression,
  VariableDeclarator,
} from './types/ast.types'
import { Visitor } from './types/visitor.types'

import { traverse } from './traverser'

let depth: number = 0

const debugVisitor: Visitor = {
  Program: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  VariableDeclaration: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  VariableDeclarator: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type} ${(node as VariableDeclarator).id.name}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  Identifier: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  ExpressionStatement: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  AssignmentExpression: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  MemberExpression: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  CallExpression: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  ArrayExpression: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  BinaryExpression: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type} ${(node as BinaryExpression).operator}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  ObjectExpression: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  Property: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  UnaryExpression: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type} ${(node as UnaryExpression).operator}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  ArrowFunctionExpression: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  BlockStatement: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  SpreadElement: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  Literal: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type} ${(node as Literal).value}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },
}

export const debugAST = (ast: AST): void => {
  traverse(ast, debugVisitor)
}
