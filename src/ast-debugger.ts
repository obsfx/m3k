import { Node, BinaryExpression, Literal, AST, UnaryExpression } from './types/ast.types'
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

  ExpressionStatement: {
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

  UnaryExpression: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type} ${(node as UnaryExpression).operator}`)
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
