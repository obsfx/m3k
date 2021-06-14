import { TokenType, Token } from './tokenizer'

interface Literal {
  type: 'Literal'
  raw: string | number
}

interface BinaryExpression {
  type: 'BinaryExpression'
  left: BinaryExpression | Literal
  operator: string
  right: BinaryExpression | Literal
}

interface AST {
  type: 'Program'
  body: BinaryExpression[]
}

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

  const constructBinaryExpressions = (params: WalkResult[], operator: string): BinaryExpression => {
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
      throw new Error(`Unexpected binary expression operand`)
    }

    let node: BinaryExpression = {
      type: 'BinaryExpression',
      left,
      operator,
      right,
    }

    return node
  }

  type WalkResult = BinaryExpression | Literal

  const walk = (): WalkResult => {
    const token: Token = consume()

    switch (token.type) {
      case TokenType.OPEN_PAREN: {
        const node: WalkResult = walk()
        if (node.type === 'BinaryExpression') {
          return node
        }

        throw new Error(`Unexpected inner expression or statement: ${node ? node.type : 'null'}`)
      }

      case TokenType.NUMBER: {
        let node: Literal = {
          type: 'Literal',
          raw: token.value,
        }

        return node
      }

      case TokenType.PLUS:
      case TokenType.MINUS:
      case TokenType.STAR:
      case TokenType.SLASH: {
        const operator: string = token.value.toString()

        const params: WalkResult[] = []
        while (peek().type !== TokenType.CLOSE_PAREN) {
          params.push(walk())
        }

        const node: BinaryExpression = constructBinaryExpressions(params, operator)

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
    if (node.type !== 'BinaryExpression') {
      throw new Error(`Undefined expression: ${node.type}`)
    }

    ast.body.push(node)
  }

  return ast
}
