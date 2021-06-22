import { TokenType, Token } from './types/token.types'
import {
  AST,
  UnaryExpression,
  BinaryExpression,
  Expression,
  Declaration,
  UnaryOperator,
  BinaryOperator,
  Literal,
  Identifier,
  VariableDeclarator,
  VariableDeclaration,
  AssignmentExpression,
  MemberExpression,
  SpreadElement,
  CallExpression,
  ArrayExpression,
  Statement,
} from './types/ast.types'

type WalkResult = Expression | Declaration | null

export const parse = (tokens: Token[]): AST => {
  let ast: AST = {
    generaltype: 'Node',
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

    // FIXME: operator type consistency
    if (!right) {
      throw new Error(`Line ${line + 1}: Missing binary expression operands`)
    }

    if (right.generaltype !== 'Expression') {
      throw new Error(
        `Line ${line + 1}: Definition in expression context, where definitions are not allowed`
      )
    }

    if (!left) {
      if (operator === '*' || operator === '/') {
        throw new Error(`Line ${line + 1}: Unexpected token: ${operator}`)
      }

      const node: UnaryExpression = {
        generaltype: 'Expression',
        type: 'UnaryExpression',
        operator: operator as UnaryOperator,
        argument: right,
      }

      return node
    }

    if (left.generaltype !== 'Expression') {
      throw new Error(
        `Line ${line + 1}: Definition in expression context, where definitions are not allowed`
      )
    }

    const node: BinaryExpression = {
      generaltype: 'Expression',
      type: 'BinaryExpression',
      operator: operator as BinaryOperator,
      left: left,
      right: right,
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
          generaltype: 'Expression',
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
        checkOpeningParen()

        const operator: string = token.value.toString()

        const params: Expression[] = []
        while (peek().type !== TokenType.CLOSE_PAREN) {
          const param: WalkResult = walk()

          if (!param) {
            throw new Error(`Line ${line + 1}: Node is null`)
          }

          if (param.generaltype !== 'Expression') {
            throw new Error(
              `Line ${
                line + 1
              }: Definition in expression context, where definitions are not allowed`
            )
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
              generaltype: 'Expression',
              type: 'Identifier',
              name,
            }

            const init: WalkResult = walk()

            if (!init) {
              throw new Error(`Line ${line + 1}: Node is null`)
            }

            if (init.generaltype !== 'Expression') {
              throw new Error(
                `Line ${
                  line + 1
                }: Definition in expression context, where definitions are not allowed`
              )
            }

            const declarations: VariableDeclarator = {
              generaltype: 'Node',
              type: 'VariableDeclarator',
              id,
              init,
            }

            const node: VariableDeclaration = {
              generaltype: 'Declaration',
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

            if (left.generaltype !== 'Expression') {
              throw new Error(
                `Line ${
                  line + 1
                }: Definition in expression context, where definitions are not allowed`
              )
            }

            if (left.type !== 'MemberExpression' && left.type !== 'Identifier') {
              throw new Error(`Line ${line + 1}: Unexpected token: ${left.type}`)
            }

            const right: WalkResult = walk()

            if (!right) {
              throw new Error(`Line ${line + 1}: Node is null`)
            }

            if (right.generaltype !== 'Expression') {
              throw new Error(
                `Line ${
                  line + 1
                }: Definition in expression context, where definitions are not allowed`
              )
            }

            const node: AssignmentExpression = {
              generaltype: 'Expression',
              type: 'AssignmentExpression',
              operator: '=',
              left,
              right,
            }

            // consume the close paren
            consume()

            return node
          }

          case 'print': {
            checkOpeningParen()

            const object: Identifier = {
              generaltype: 'Expression',
              type: 'Identifier',
              name: 'console',
            }

            const property: Identifier = {
              generaltype: 'Expression',
              type: 'Identifier',
              name: 'log',
            }

            const callee: MemberExpression = {
              generaltype: 'Expression',
              type: 'MemberExpression',
              object,
              property,
            }

            const args: (Expression | SpreadElement)[] = []

            while (peek().type !== TokenType.CLOSE_PAREN) {
              const arg: WalkResult = walk()

              if (!arg) {
                throw new Error(`Line ${line + 1}: Node is null`)
              }

              if (arg.generaltype === 'Declaration') {
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
              generaltype: 'Expression',
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

            const elements: (Expression | SpreadElement)[] = []

            while (peek().type !== TokenType.CLOSE_PAREN) {
              const element: WalkResult = walk()

              if (!element) {
                throw new Error(`Line ${line + 1}: Node is null`)
              }

              if (element.generaltype === 'Declaration') {
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
              generaltype: 'Expression',
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

            if (property.generaltype !== 'Expression') {
              throw new Error(
                `Line ${
                  line + 1
                }: Definition in expression context, where definitions are not allowed`
              )
            }

            const object: WalkResult = walk()

            if (!object) {
              throw new Error(`Line ${line + 1}: Node is null`)
            }

            if (object.generaltype !== 'Expression') {
              throw new Error(
                `Line ${
                  line + 1
                }: Definition in expression context, where definitions are not allowed`
              )
            }

            const node: MemberExpression = {
              generaltype: 'Expression',
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
              const arg: WalkResult = walk()

              if (!arg) {
                throw new Error(`Line ${line + 1}: Node is null`)
              }

              if (arg.generaltype !== 'Expression') {
                throw new Error(
                  `Line ${
                    line + 1
                  }: Definition in expression context, where definitions are not allowed`
                )
              }

              const spreadElement: SpreadElement = {
                generaltype: 'Node',
                type: 'SpreadElement',
                argument: arg,
              }

              elements.push(spreadElement)

              if (!peek()) {
                throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`)
              }
            }

            const node: ArrayExpression = {
              generaltype: 'Expression',
              type: 'ArrayExpression',
              elements,
            }

            // consume the close paren
            consume()

            return node
          }

          case 'unshift':
          case 'push':
          case 'includes':
          case 'fill':
          case 'concat':
          case 'join':
          case 'slice':
          case 'splice': {
            checkOpeningParen()

            const object: WalkResult = walk()

            if (!object) {
              throw new Error(`Line ${line + 1}: Node is null`)
            }

            if (object.generaltype !== 'Expression') {
              throw new Error(
                `Line ${
                  line + 1
                }: Definition in expression context, where definitions are not allowed`
              )
            }

            const property: Identifier = {
              generaltype: 'Expression',
              type: 'Identifier',
              name: token.value.toString(),
            }

            const callee: MemberExpression = {
              generaltype: 'Expression',
              type: 'MemberExpression',
              object,
              property,
            }

            const args: (Expression | SpreadElement)[] = []

            while (peek().type !== TokenType.CLOSE_PAREN) {
              const arg: WalkResult = walk()

              if (!arg) {
                throw new Error(`Line ${line + 1}: Node is null`)
              }

              if (arg.generaltype === 'Declaration') {
                throw new Error(
                  `Line ${
                    line + 1
                  }: Definition in expression context, where definitions are not allowed`
                )
              }

              args.push(arg)
            }

            const node: CallExpression = {
              generaltype: 'Expression',
              type: 'CallExpression',
              callee,
              arguments: args,
            }

            // consume the close paren
            consume()

            return node
          }

          case 'shift':
          case 'pop':
          case 'reverse': {
            checkOpeningParen()

            const object: WalkResult = walk()

            if (!object) {
              throw new Error(`Line ${line + 1}: Node is null`)
            }

            if (object.generaltype !== 'Expression') {
              throw new Error(
                `Line ${
                  line + 1
                }: Definition in expression context, where definitions are not allowed`
              )
            }

            const property: Identifier = {
              generaltype: 'Expression',
              type: 'Identifier',
              name: token.value.toString(),
            }

            const callee: MemberExpression = {
              generaltype: 'Expression',
              type: 'MemberExpression',
              object,
              property,
            }

            const node: CallExpression = {
              generaltype: 'Expression',
              type: 'CallExpression',
              callee,
              arguments: [],
            }

            // consume the close paren
            consume()

            return node
          }

          case 'length': {
            checkOpeningParen()

            const object: WalkResult = walk()

            if (!object) {
              throw new Error(`Line ${line + 1}: Node is null`)
            }

            if (object.generaltype !== 'Expression') {
              throw new Error(
                `Line ${
                  line + 1
                }: Definition in expression context, where definitions are not allowed`
              )
            }

            const property: Identifier = {
              generaltype: 'Expression',
              type: 'Identifier',
              name: 'length',
            }

            const node: MemberExpression = {
              generaltype: 'Expression',
              type: 'MemberExpression',
              object,
              property,
            }

            // consume the close paren
            consume()

            return node
          }

          //case 'dict': {
          //  checkOpeningParen()

          //  while (peek().type !== TokenType.CLOSE_PAREN) {}
          //}

          default: {
            // if (definedIdentifiers.includes(token.value.toString())) {
            const id: Identifier = {
              generaltype: 'Expression',
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
      ast.body.push(node as Statement)
    }
  }

  return ast
}
