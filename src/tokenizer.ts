import { TokenType, Token } from './types/token.types'

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

      case '"':
        {
          let str: string = ''

          while (current < input.length && peek() !== '"') {
            str += consume()
          }

          if (peek() !== '"') {
            throw new Error('Unexpected character')
          }

          // consume closing quotes
          consume()

          tokens.push({ type: TokenType.STRING, value: `"${str}"` })
        }
        break

      case '\n':
        tokens.push({ type: TokenType.NEWLINE, value: '' })
        break

      case ' ':
        break

      default:
        {
          if (!isNaN(Number(char))) {
            let numbers: string = char

            while (!isNaN(parseInt(peek()))) {
              numbers += consume()
            }

            tokens.push({ type: TokenType.NUMBER, value: Number(numbers) })
          } else if (/^[A-Za-z0-9_@-]*$/.test(char)) {
            let identifier: string = char

            while (/^[A-Za-z0-9_!@-]*$/.test(peek())) {
              identifier += consume()
            }

            tokens.push({ type: TokenType.IDENTIFIER, value: identifier })
          } else {
            throw new Error(`Unexpected character: ${char}`)
          }
        }
        break
    }
  }

  return tokens
}
