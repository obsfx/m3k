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
  MemberExpression,
  CallExpression,
  ArrayExpression,
  SpreadElement,
  ObjectExpression,
  Property,
  ArrowFunctionExpression,
  BlockStatement,
  Declaration,
  Expression,
  Statement,
  IfStatement,
} from './types/ast.types'

export const generate = (node: Node): string => {
  switch (node.type) {
    case 'Program':
      return (node as AST).body.map(generate).join('\n')

    case 'BlockStatement': {
      let lastNode: Expression | Declaration | Statement | undefined = undefined

      if (
        (node as BlockStatement).body[(node as BlockStatement).body.length - 1] &&
        (node as BlockStatement).body[(node as BlockStatement).body.length - 1].generaltype !==
          'Statement' &&
        (node as BlockStatement).body[(node as BlockStatement).body.length - 1].type !==
          'AssignmentExpression'
      ) {
        lastNode = (node as BlockStatement).body.pop()
      }

      return `{${(node as BlockStatement).body.map(generate).join('\n')}${
        lastNode ? `\nreturn ${generate(lastNode)}` : ''
      }}`
    }

    case 'IfStatement':
      return `if (${generate((node as IfStatement).test)}) ${generate(
        (node as IfStatement).consequent
      )} ${
        (node as IfStatement).alternate
          ? `${generate((node as IfStatement).alternate as BlockStatement)}`
          : ''
      }`

    case 'VariableDeclaration':
      return `${(node as VariableDeclaration).kind} ${(
        node as VariableDeclaration
      ).declarations.map(generate)};`

    case 'VariableDeclarator':
      return `${generate((node as VariableDeclarator).id)} = ${generate(
        (node as VariableDeclarator).init
      )}`

    case 'Identifier':
      return `${(node as Identifier).name
        .split('-')
        .map((e: string, i: number) => (i === 0 ? e : `${e[0].toUpperCase()}${e.slice(1)}`))
        .join('')}`

    case 'ExpressionStatement':
      return `${generate((node as ExpressionStatement).expression)};`

    case 'AssignmentExpression':
      return `${generate((node as AssignmentExpression).left)} ${
        (node as AssignmentExpression).operator
      } ${generate((node as AssignmentExpression).right)}`

    case 'CallExpression': {
      if ((node as CallExpression).callee.type === 'ArrowFunctionExpression') {
        return `(${generate((node as CallExpression).callee)})(${(node as CallExpression).arguments
          .map(generate)
          .join(', ')})`
      } else {
        return `${generate((node as CallExpression).callee)}(${(node as CallExpression).arguments
          .map(generate)
          .join(', ')})`
      }
    }

    case 'ArrayExpression':
      return `[${(node as ArrayExpression).elements.map(generate).join(', ')}]`

    case 'ArrowFunctionExpression': {
      if ((node as ArrowFunctionExpression).body.type !== 'BlockStatement') {
        return `(${(node as ArrowFunctionExpression).params
          .map(generate)
          .join(', ')}) => (${generate((node as ArrowFunctionExpression).body)})`
      } else {
        return `(${(node as ArrowFunctionExpression).params
          .map(generate)
          .join(', ')}) => ${generate((node as ArrowFunctionExpression).body)}`
      }
    }

    case 'MemberExpression': {
      if ((node as MemberExpression).property.type === 'Identifier') {
        return `${generate((node as MemberExpression).object)}.${generate(
          (node as MemberExpression).property
        )}`
      } else {
        return `${generate((node as MemberExpression).object)}[${generate(
          (node as MemberExpression).property
        )}]`
      }
    }

    case 'ObjectExpression':
      return `{${(node as ObjectExpression).properties.map(generate).join(', ')}}`

    case 'Property':
      return `${generate((node as Property).key)}: ${generate((node as Property).value)}`

    case 'BinaryExpression':
      return `${generate((node as BinaryExpression).left)} ${
        (node as BinaryExpression).operator
      } ${generate((node as BinaryExpression).right)}`

    case 'UnaryExpression':
      return `${(node as UnaryExpression).operator}${generate((node as UnaryExpression).argument)}`

    case 'SpreadElement':
      return `...${generate((node as SpreadElement).argument)}`

    case 'Literal':
      return `${(node as Literal).value}`

    default:
      throw new Error(`Undefined AST node: ${node.type}`)
  }
}
