import { AST, Node, BinaryExpression } from './types/ast.types'
import { VisitorMethods, Visitor } from './types/visitor.types'

export const traverse = (ast: AST, visitor: Visitor): void => {
  const traverseArray = (array: Node[], parent: Node): void => {
    for (let i: number = 0; i < array.length; i++) {
      traverseNode(array[i], parent)
    }
  }

  const traverseNode = (node: Node, parent: Node): void => {
    const methods: VisitorMethods = visitor[node.type]

    methods.enter(node, parent)

    switch (node.type) {
      case 'Program':
        traverseArray((node as AST).body, node)
        break

      case 'BinaryExpression':
        traverseNode((node as BinaryExpression).left, node)
        traverseNode((node as BinaryExpression).right, node)
        break

      case 'Literal':
        break

      default:
        throw new Error(`Undefined AST node type: ${node.type}`)
    }

    methods.exit(node, parent)
  }

  traverseNode(ast, ast)
}
