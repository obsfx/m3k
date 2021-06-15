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
