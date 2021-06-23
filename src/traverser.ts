import {
  AST,
  NodeType,
  Node,
  BinaryExpression,
  ExpressionStatement,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarator,
  AssignmentExpression,
  CallExpression,
  MemberExpression,
  ArrayExpression,
  SpreadElement,
  ObjectExpression,
  Property,
  ArrowFunctionExpression,
  BlockStatement,
  IfStatement,
} from './types/ast.types'
import { VisitorMethods, Visitor } from './types/visitor.types'

export const traverse = (ast: AST, visitor: Visitor): void => {
  const traverseArray = (array: Node[], parent: Node): void => {
    for (let i: number = 0; i < array.length; i++) {
      traverseNode(array[i], parent)
    }
  }

  const traverseNode = (node: Node, parent: Node): void => {
    const methods: VisitorMethods = visitor[node.type as NodeType]

    if (methods && methods.enter) {
      methods.enter(node, parent)
    }

    switch (node.type) {
      case 'Program':
        traverseArray((node as AST).body, node)
        break

      case 'BlockStatement':
        traverseArray((node as BlockStatement).body, node)
        break

      case 'IfStatement':
        {
          traverseNode((node as IfStatement).consequent, node)
          if ((node as IfStatement).alternate !== null) {
            traverseNode((node as IfStatement).alternate as BlockStatement, node)
          }
        }
        break

      case 'VariableDeclaration':
        traverseArray((node as VariableDeclaration).declarations, node)
        break

      case 'VariableDeclarator':
        traverseNode((node as VariableDeclarator).init, node)
        break

      case 'ExpressionStatement':
        traverseNode((node as ExpressionStatement).expression, node)
        break

      case 'CallExpression':
        traverseNode((node as CallExpression).callee, node)
        traverseArray((node as CallExpression).arguments, node)
        break

      case 'ArrayExpression':
        traverseArray((node as ArrayExpression).elements, node)
        break

      case 'MemberExpression':
        traverseNode((node as MemberExpression).object, node)
        traverseNode((node as MemberExpression).property, node)
        break

      case 'ObjectExpression':
        traverseArray((node as ObjectExpression).properties, node)
        break

      case 'Property':
        traverseNode((node as Property).key, node)
        traverseNode((node as Property).value, node)
        break

      case 'AssignmentExpression':
        traverseNode((node as AssignmentExpression).left, node)
        traverseNode((node as AssignmentExpression).right, node)
        break

      case 'ArrowFunctionExpression':
        traverseArray((node as ArrowFunctionExpression).params, node)
        traverseNode((node as ArrowFunctionExpression).body, node)
        break

      case 'BinaryExpression':
        traverseNode((node as BinaryExpression).left, node)
        traverseNode((node as BinaryExpression).right, node)
        break

      case 'UnaryExpression':
        traverseNode((node as UnaryExpression).argument, node)
        break

      case 'SpreadElement':
        traverseNode((node as SpreadElement).argument, node)
        break

      case 'Identifier':
      case 'Literal':
        break

      default:
        throw new Error(`Undefined AST node type: ${node.type}`)
    }

    if (methods && methods.exit) {
      methods.exit(node, parent)
    }
  }

  traverseNode(ast, ast)
}
