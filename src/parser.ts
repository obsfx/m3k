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
  SpreadElement,
} from './types/ast.types'

type WalkResult = VariableDeclaration | InnerNode | null

export const parse = (tokens: Token[]): AST => {
  let ast: AST = {
    type: 'Program',
    body: [],
  }
  let current: number = 0
  let line: number = 0

  const definedIdentifiers: string[] = []

  const consume = (): Token | null => {
    return tokens[current++] || null
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
      throw new Error(`Line ${line + 1}: Missing binary expression operands`)
    }

    if (!left) {
      if (operator === '*' || operator === '/') {
        throw new Error(`Line ${line + 1}: Unexpected token: ${operator}`)
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
      throw new Error(`Line ${line + 1}: Syntax error: Please check the paranthesis openings`)
    }
  }

  const walk = (): WalkResult => {
    const token: Token | null = consume()

    if (!token) {
      return null
    }

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

      case TokenType.NEWLINE:
        line++
        return walk()

      case TokenType.PLUS:
      case TokenType.MINUS:
      case TokenType.STAR:
      case TokenType.SLASH: {
        if (!before() || before().type !== TokenType.OPEN_PAREN) {
          throw new Error('Line ${line + 1}: Syntax error: Please check the opening paranthesis')
        }

        const operator: string = token.value.toString()

        const params: InnerNode[] = []
        while (peek().type !== TokenType.CLOSE_PAREN) {
          const param: WalkResult = walk()

          if (param && param.type === 'VariableDeclaration') {
            throw new Error(
              `Line ${
                line + 1
              }: Definition in expression context, where definitions are not allowed`
            )
          }

          if (!param) {
            throw new Error(`Line ${line + 1}: Node is null`)
          }

          params.push(param)

          if (!peek()) {
            throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`)
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
              throw new Error(`Line ${line + 1}: Unexpected token: ${peek().type}`)
            }

            const idToken: Token | null = consume()

            if (!idToken) {
              throw new Error(`Line ${line + 1}: Token is null`)
            }

            const name: string = idToken.value.toString()

            if (definedIdentifiers.includes(name)) {
              throw new Error(`Line ${line + 1}: ${name} is already defined.`)
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

            const left: WalkResult = walk()

            if (!left) {
              throw new Error(`Line ${line + 1}: Node is null`)
            }

            if (left.type !== 'MemberExpression' && left.type !== 'Identifier') {
              throw new Error(`Line ${line + 1}: Unexpected token: ${left.type}`)
            }

            const right: WalkResult = walk()

            if (!right) {
              throw new Error(`Line ${line + 1}: Node is null`)
            }

            if (right.type === 'VariableDeclaration') {
              throw new Error(
                `Line ${
                  line + 1
                }: Definition in expression context, where definitions are not allowed`
              )
            }

            const node: AssignmentExpression = {
              type: 'AssignmentExpression',
              left,
              operator: '=',
              right,
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

              if (!arg) {
                throw new Error(`Line ${line + 1}: Node is null`)
              }

              if (arg.type === 'VariableDeclaration') {
                throw new Error(
                  `Line ${
                    line + 1
                  }: Definition in expression context, where definitions are not allowed`
                )
              }

              args.push(arg)

              if (!peek()) {
                throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`)
              }
            }

            if (args.length === 0) {
              throw Error(`Line ${line + 1}: "print": You must pass one or more arguments`)
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

              if (!element) {
                throw new Error(`Line ${line + 1}: Node is null`)
              }

              if (element.type === 'VariableDeclaration') {
                throw new Error(
                  `Line ${
                    line + 1
                  }: Definition in expression context, where definitions are not allowed`
                )
              }

              elements.push(element)

              if (!peek()) {
                throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`)
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

            if (!property) {
              throw new Error(`Line ${line + 1}: Node is null`)
            }

            if (
              property.type !== 'MemberExpression' &&
              property.type !== 'CallExpression' &&
              property.type !== 'ArrayExpression' &&
              property.type !== 'Identifier' &&
              property.type !== 'Literal'
            ) {
              throw new Error(`Line ${line + 1}: Error: Unexpected first "nth" argument`)
            }

            const object: WalkResult = walk()

            if (!object) {
              throw new Error(`Line ${line + 1}: Node is null`)
            }

            if (
              object.type !== 'MemberExpression' &&
              object.type !== 'CallExpression' &&
              object.type !== 'ArrayExpression' &&
              object.type !== 'Identifier' &&
              object.type !== 'Literal'
            ) {
              throw new Error(`Line ${line + 1}: Error: Unexpected second "nth" argument`)
            }

            const node: MemberExpression = {
              type: 'MemberExpression',
              object,
              property,
            }

            // consume the close paren
            consume()

            return node
          }

          case 'append': {
            checkOpeningParen()

            const elements: SpreadElement[] = []

            while (peek().type !== TokenType.CLOSE_PAREN) {
              const element: WalkResult = walk()

              if (!element) {
                throw new Error(`Line ${line + 1}: Node is null`)
              }

              if (
                element.type !== 'MemberExpression' &&
                element.type !== 'CallExpression' &&
                element.type !== 'ArrayExpression' &&
                element.type !== 'Identifier'
              ) {
                throw new Error(
                  `Line ${
                    line + 1
                  }: Definition in expression context, where definitions are not allowed`
                )
              }

              const spreadElement: SpreadElement = {
                type: 'SpreadElement',
                argument: element,
              }

              elements.push(spreadElement)

              if (!peek()) {
                throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`)
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

          default: {
            // if (definedIdentifiers.includes(token.value.toString())) {
            const id: Identifier = {
              type: 'Identifier',
              name: token.value.toString(),
            }

            return id
            // }

            //throw new Error(`Line ${line + 1}: Undefined identifier: ${token.value}`)
          }
        }
      }

      default:
        throw new Error(`Line ${line + 1}: Undefined token: ${token.type}`)
    }
  }

  while (current < tokens.length) {
    const node: WalkResult = walk()

    if (node) {
      ast.body.push(node as BinaryExpression | UnaryExpression)
    }
  }

  return ast
}
