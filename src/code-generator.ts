import { Node, BinaryExpression, Literal, AST, ExpressionStatement } from './types/ast.types'

export const generate = (node: Node): string => {
  switch (node.type) {
    case 'Program':
      return (node as AST).body.map(generate).join('\n')

    case 'ExpressionStatement':
      return `${generate((node as ExpressionStatement).expression)};`

    case 'BinaryExpression':
      return `${generate((node as BinaryExpression).left)} ${
        (node as BinaryExpression).operator
      } ${generate((node as BinaryExpression).right)}`

    case 'Literal':
      return `${(node as Literal).value}`

    default:
      throw new Error(`Undefined AST node: ${node.type}`)
  }
}
