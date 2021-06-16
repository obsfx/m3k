import { TokenType, Token } from './types/token.types'
import {
  AST,
  UnaryExpression,
  BinaryExpression,
  Literal,
  VariableDeclarator,
  Identifier,
  VariableDeclaration,
} from './types/ast.types'

type WalkResult = VariableDeclaration | BinaryExpression | UnaryExpression | Literal

export const parse = (tokens: Token[]): AST => {
  let ast: AST = {
    type: 'Program',
    body: [],
  }
  let current: number = 0

  const VARIABLES_MAP: Map<string, UnaryExpression | BinaryExpression | Literal> = new Map<
    string,
    UnaryExpression | BinaryExpression | Literal
  >()

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

  const walk = (): WalkResult => {
    const token: Token = consume()

    switch (token.type) {
      case TokenType.OPEN_PAREN: {
        const node: WalkResult = walk()
        return node
      }

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
          throw new Error('Syntax error: Please check the paranthesis openings')
        }

        const operator: string = token.value.toString()

        const params: WalkResult[] = []
        while (peek().type !== TokenType.CLOSE_PAREN) {
          params.push(walk())

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
            if (!before() || before().type !== TokenType.OPEN_PAREN) {
              throw new Error('Syntax error: Please check the paranthesis openings')
            }

            if (peek().type !== TokenType.IDENTIFIER) {
              throw new Error(`Unexpected token: ${peek().type}`)
            }

            const name: string = consume().value.toString()

            if (VARIABLES_MAP.has(name)) {
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

            VARIABLES_MAP.set(name, init as UnaryExpression | BinaryExpression | Literal)

            return node
          }

          case 'set!':
            break

          default: {
            const value: UnaryExpression | BinaryExpression | Literal | undefined =
              VARIABLES_MAP.get(token.value.toString())

            if (value) {
              return value
            }

            throw new Error(`Undefined identifier: ${token.value}`)
          }
        }

        return {
          type: 'Literal',
          value: 1,
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
