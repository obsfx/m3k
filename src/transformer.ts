import {
  AST,
  Node,
  ExpressionStatement,
  BinaryExpression,
  UnaryExpression,
} from './types/ast.types'
import { Visitor } from './types/visitor.types'

import { traverse } from './traverser'

export const transform = (ast: AST): AST => {
  const newAst: AST = JSON.parse(JSON.stringify(ast))

  const transformerVisitor: Visitor = {
    BinaryExpression: {
      enter: (node: Node, parent: Node): void => {
        if (parent.type !== 'BinaryExpression') {
          if (parent.type === 'Program') {
            const newNode: ExpressionStatement = {
              type: 'ExpressionStatement',
              expression: node as BinaryExpression,
            }

            for (let i: number = 0; i < (parent as AST).body.length; i++) {
              if ((parent as AST).body[i] === node) {
                ;(parent as AST).body[i] = newNode
              }
            }
          }
        }
      },
    },

    UnaryExpression: {
      enter: (node: Node, parent: Node): void => {
        if (parent.type !== 'BinaryExpression') {
          if (parent.type === 'Program') {
            const newNode: ExpressionStatement = {
              type: 'ExpressionStatement',
              expression: node as UnaryExpression,
            }

            for (let i: number = 0; i < (parent as AST).body.length; i++) {
              if ((parent as AST).body[i] === node) {
                ;(parent as AST).body[i] = newNode
              }
            }
          }
        }
      },
    },
  }

  traverse(newAst, transformerVisitor)

  return newAst
}
