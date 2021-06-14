export enum TokenType {
  OPEN_PAREN = 'OPEN_PAREN',
  CLOSE_PAREN = 'CLOSE_PAREN',
  MINUS = 'MINUS',
  PLUS = 'PLUS',
  SLASH = 'SLASH',
  STAR = 'STAR',
  EQUAL = 'EQUAL',
  GREATER = 'GREATER',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS = 'LESS',
  LESS_EQUAL = 'LESS_EQUAL',
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  IF = 'IF',
  ELSE = 'ELSE',
  NIL = 'NIL',
  FUN = 'FUN',
  SPACE = 'SPACE',
}

export interface Token {
  type: TokenType
  value: number | string
}

export const tokenize = (input: string): Token[] => {
  let tokens: Token[] = []
  let current: number = 0

  const isEnd = (): boolean => {
    return current >= input.length
  }

  const consume = (): string => {
    return input[current++]
  }

  const peek = (): string => {
    if (isEnd()) {
      return '\0'
    }

    return input[current]
  }

  while (current < input.length) {
    const char: string = consume()

    switch (char) {
      case '(':
        tokens.push({ type: TokenType.OPEN_PAREN, value: '' })
        break

      case ')':
        tokens.push({ type: TokenType.CLOSE_PAREN, value: '' })
        break

      case '-':
        tokens.push({ type: TokenType.MINUS, value: '-' })
        break

      case '+':
        if (peek() !== ' ') {
          throw new Error(`Unexpected first symbol character: ${peek()}`)
        }
        tokens.push({ type: TokenType.PLUS, value: '+' })
        break

      case '/':
        if (peek() !== ' ') {
          throw new Error(`Unexpected first symbol character: ${peek()}`)
        }
        tokens.push({ type: TokenType.SLASH, value: '/' })
        break

      case '*':
        if (peek() !== ' ') {
          throw new Error(`Unexpected first symbol character: ${peek()}`)
        }
        tokens.push({ type: TokenType.STAR, value: '*' })
        break

      case '=':
        if (peek() !== ' ') {
          throw new Error(`Unexpected first symbol character: ${peek()}`)
        }
        tokens.push({ type: TokenType.EQUAL, value: '' })
        break

      case ' ':
        //tokens.push({ type: TokenType.SPACE, value: '' })
        break

      default:
        {
          if (!isNaN(Number(char))) {
            let numbers: string = char

            while (!isNaN(parseInt(peek()))) {
              numbers += consume()
            }

            tokens.push({ type: TokenType.NUMBER, value: Number(numbers) })
          } else {
            throw new Error(`Unexpected character: ${char}`)
          }
        }
        break
    }
  }

  return tokens
}
