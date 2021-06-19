import { TokenType, Token } from './types/token.types'
import {
  InnerNode,
  AST,
  UnaryExpression,
  BinaryExpression,
  Literal,
  VariableDeclarator,
  Identifier,
  VariableDeclaration,
  AssignmentExpression,
  MemberExpression,
  CallExpression,
  ArrayExpression,
} from './types/ast.types'

type WalkResult = VariableDeclaration | InnerNode

export const parse = (tokens: Token[]): AST => {
  let ast: AST = {
    type: 'Program',
    body: [],
  }
  let current: number = 0

  const definedIdentifiers: string[] = []

  const consume = (): Token => {
    return tokens[current++]
  }

  const peek = (offet: number = 0): Token => {
    return tokens[current + offet]
  }

  const before = (): Token => {
    return tokens[current - 2]
  }

  const constructBinaryExpressions = (
    params: WalkResult[],
    operator: string
  ): UnaryExpression | BinaryExpression => {
    const right: WalkResult | undefined = params.pop()
    const left: WalkResult | null | undefined =
      params.length === 0
        ? null
        : params.length === 1
        ? params.pop()
        : constructBinaryExpressions(params, operator)

    if (!right) {
      throw new Error(`Missing binary expression operands`)
    }

    if (!left) {
      if (operator === '*' || operator === '/') {
        throw new Error(`Unexpected token: ${operator}`)
      }

      const node: UnaryExpression = {
        type: 'UnaryExpression',
        operator,
        argument: right as Literal,
      }

      return node
    }

    const node: BinaryExpression = {
      type: 'BinaryExpression',
      left: left as Literal,
      operator,
      right: right as Literal,
    }

    return node
  }

  const checkOpeningParen = (): void => {
    if (!before() || before().type !== TokenType.OPEN_PAREN) {
      throw new Error('Syntax error: Please check the paranthesis openings')
    }
  }

  const walk = (): WalkResult => {
    const token: Token = consume()

    switch (token.type) {
      case TokenType.OPEN_PAREN: {
        const node: WalkResult = walk()
        return node
      }

      case TokenType.STRING:
      case TokenType.NUMBER: {
        let node: Literal = {
          type: 'Literal',
          value: token.value,
        }

        return node
      }

      case TokenType.PLUS:
      case TokenType.MINUS:
      case TokenType.STAR:
      case TokenType.SLASH: {
        if (!before() || before().type !== TokenType.OPEN_PAREN) {
          throw new Error('Syntax error: Please check the opening paranthesis')
        }

        const operator: string = token.value.toString()

        const params: InnerNode[] = []
        while (peek().type !== TokenType.CLOSE_PAREN) {
          const param: WalkResult = walk()

          if (param.type === 'VariableDeclaration') {
            throw new Error(`Definition in expression context, where definitions are not allowed`)
          }

          params.push(param)

          if (!peek()) {
            throw new Error('Syntax error: Unclosed paranthesis')
          }
        }

        const node: BinaryExpression | UnaryExpression = constructBinaryExpressions(
          params,
          operator
        )

        // consume the close paren
        consume()

        return node
      }

      case TokenType.IDENTIFIER: {
        switch (token.value.toString()) {
          case 'define': {
            checkOpeningParen()

            if (peek().type !== TokenType.IDENTIFIER) {
              throw new Error(`Unexpected token: ${peek().type}`)
            }

            const name: string = consume().value.toString()

            if (definedIdentifiers.includes(name)) {
              throw new Error(`${name} is already defined.`)
            }

            const id: Identifier = {
              type: 'Identifier',
              name,
            }

            const init: WalkResult = walk()

            const declarations: VariableDeclarator = {
              type: 'VariableDeclarator',
              id,
              init: init as UnaryExpression | BinaryExpression | Literal,
            }

            const node: VariableDeclaration = {
              type: 'VariableDeclaration',
              declarations: [declarations],
              kind: 'let',
            }

            // consume the close paren
            consume()

            definedIdentifiers.push(name)

            return node
          }

          case 'set!': {
            checkOpeningParen()

            if (peek().type !== TokenType.IDENTIFIER) {
              throw new Error(`Unexpected token: ${peek().type}`)
            }

            const name: string = consume().value.toString()

            if (!definedIdentifiers.includes(name)) {
              throw new Error(`${name} is not defined.`)
            }

            const id: Identifier = {
              type: 'Identifier',
              name,
            }

            const right: WalkResult = walk()

            const node: AssignmentExpression = {
              type: 'AssignmentExpression',
              left: id,
              operator: '=',
              right: right as UnaryExpression | BinaryExpression | Literal,
            }

            // consume the close paren
            consume()

            return node
          }

          case 'print': {
            checkOpeningParen()

            const object: Identifier = {
              type: 'Identifier',
              name: 'console',
            }

            const property: Identifier = {
              type: 'Identifier',
              name: 'log',
            }

            const callee: MemberExpression = {
              type: 'MemberExpression',
              object,
              property,
            }

            const args: InnerNode[] = []

            while (peek().type !== TokenType.CLOSE_PAREN) {
              const arg: WalkResult = walk()

              if (arg.type === 'VariableDeclaration') {
                throw new Error(
                  `Definition in expression context, where definitions are not allowed`
                )
              }

              args.push(arg)

              if (!peek()) {
                throw new Error('Syntax error: Unclosed paranthesis')
              }
            }

            if (args.length === 0) {
              throw Error(`"print": You must pass one or more arguments`)
            }

            const node: CallExpression = {
              type: 'CallExpression',
              callee,
              arguments: args,
            }

            // consume the close paren
            consume()

            return node
          }

          case 'list': {
            checkOpeningParen()

            const elements: InnerNode[] = []

            while (peek().type !== TokenType.CLOSE_PAREN) {
              const element: WalkResult = walk()

              if (element.type === 'VariableDeclaration') {
                throw new Error(
                  `Definition in expression context, where definitions are not allowed`
                )
              }

              elements.push(element)

              if (!peek()) {
                throw new Error('Syntax error: Unclosed paranthesis')
              }
            }

            const node: ArrayExpression = {
              type: 'ArrayExpression',
              elements,
            }

            // consume the close paren
            consume()

            return node
          }

          case 'nth': {
            checkOpeningParen()
            const property: WalkResult = walk()

            if (property.type !== 'Literal') {
              throw new Error(`Error: "nth" expects a Literal as first argument`)
            }

            const listArg: WalkResult = walk()

            if (listArg.type === 'Identifier' && !definedIdentifiers.includes(listArg.name)) {
              throw new Error(`Undefined identifier: ${listArg.name}`)
            } else if (listArg.type !== 'Identifier' && listArg.type !== 'ArrayExpression') {
              throw new Error(
                `Error: "nth" expects an ArrayExpression or Literal as second argument`
              )
            }

            const node: MemberExpression = {
              type: 'MemberExpression',
              object: listArg,
              property,
            }

            // consume the close paren
            consume()

            return node
          }

          default: {
            if (definedIdentifiers.includes(token.value.toString())) {
              const id: Identifier = {
                type: 'Identifier',
                name: token.value.toString(),
              }

              return id
            }

            throw new Error(`Undefined identifier: ${token.value}`)
          }
        }
      }

      default:
        throw new Error(`Undefined token: ${token.type}`)
    }
  }

  while (current < tokens.length) {
    const node: WalkResult = walk()
    ast.body.push(node as BinaryExpression | UnaryExpression)
  }

  return ast
}
