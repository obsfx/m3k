import { TokenType, Token } from './types/token.types'
import { AST, UnaryExpression, BinaryExpression, Literal } from './types/ast.types'

type WalkResult = BinaryExpression | UnaryExpression | Literal

export const parse = (tokens: Token[]): AST => {
  let ast: AST = {
    type: 'Program',
    body: [],
  }
  let current: number = 0

  const consume = (): Token => {
    return tokens[current++]
  }

  const peek = (): Token => {
    return tokens[current]
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
