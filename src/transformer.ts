import {
  AST,
  Node,
  ExpressionStatement,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  AssignmentExpression,
  ArrayExpression,
} from './types/ast.types'
import { Visitor } from './types/visitor.types'

import { traverse } from './traverser'

export const transform = (ast: AST): AST => {
  const newAst: AST = JSON.parse(JSON.stringify(ast))

  const wrapWithExpressionStatement = (node: Node, parent: Node): void => {
    const newNode: ExpressionStatement = {
      type: 'ExpressionStatement',
      expression: node as
        | CallExpression
        | ArrayExpression
        | BinaryExpression
        | UnaryExpression
        | AssignmentExpression,
    }

    for (let i: number = 0; i < (parent as AST).body.length; i++) {
      if ((parent as AST).body[i] === node) {
        ;(parent as AST).body[i] = newNode
      }
    }
  }

  const transformerVisitor: Visitor = {
    BinaryExpression: {
      enter: (node: Node, parent: Node): void => {
        if (parent.type === 'Program') {
          wrapWithExpressionStatement(node, parent)
        }
      },
    },

    UnaryExpression: {
      enter: (node: Node, parent: Node): void => {
        if (parent.type === 'Program') {
          wrapWithExpressionStatement(node, parent)
        }
      },
    },

    AssignmentExpression: {
      enter: (node: Node, parent: Node): void => {
        if (parent.type === 'Program') {
          wrapWithExpressionStatement(node, parent)
        }
      },
    },

    CallExpression: {
      enter: (node: Node, parent: Node): void => {
        if (parent.type === 'Program') {
          wrapWithExpressionStatement(node, parent)
        }
      },
    },

    ArrayExpression: {
      enter: (node: Node, parent: Node): void => {
        if (parent.type === 'Program') {
          wrapWithExpressionStatement(node, parent)
        }
      },
    },
  }

  traverse(newAst, transformerVisitor)

  return newAst
}
