import {
  Node,
  BinaryExpression,
  Literal,
  AST,
  ExpressionStatement,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarator,
  Identifier,
  AssignmentExpression,
} from './types/ast.types'

export const generate = (node: Node): string => {
  switch (node.type) {
    case 'Program':
      return (node as AST).body.map(generate).join('\n')

    case 'VariableDeclaration':
      return `${(node as VariableDeclaration).kind} ${(
        node as VariableDeclaration
      ).declarations.map(generate)};`

    case 'VariableDeclarator':
      return `${generate((node as VariableDeclarator).id)} = ${generate(
        (node as VariableDeclarator).init
      )}`

    case 'Identifier':
      return `${(node as Identifier).name.split('-').join('_')}`

    case 'ExpressionStatement':
      return `${generate((node as ExpressionStatement).expression)};`

    case 'AssignmentExpression':
      return `${generate((node as AssignmentExpression).left)} ${
        (node as AssignmentExpression).operator
      } ${generate((node as AssignmentExpression).right)}`

    case 'BinaryExpression':
      return `${generate((node as BinaryExpression).left)} ${
        (node as BinaryExpression).operator
      } ${generate((node as BinaryExpression).right)}`

    case 'UnaryExpression':
      return `${(node as UnaryExpression).operator} ${generate((node as UnaryExpression).argument)}`

    case 'Literal':
      return `${(node as Literal).value}`

    default:
      throw new Error(`Undefined AST node: ${node.type}`)
  }
}
