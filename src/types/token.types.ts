export enum TokenType {
  OPEN_PAREN = 'OPEN_PAREN',
  CLOSE_PAREN = 'CLOSE_PAREN',
  MINUS = 'MINUS',
  PLUS = 'PLUS',
  SLASH = 'SLASH',
  STAR = 'STAR',
  EQUAL = 'EQUAL',
  MODULO = 'MODULO',
  BANG = 'BANG',
  BANG_EQUAL = 'BANG_EQUAL',
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
  NEWLINE = 'NEWLINE',
}

export interface Token {
  type: TokenType
  value: number | string
}
