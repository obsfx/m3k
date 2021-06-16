export type NodeType = 'Program' | 'ExpressionStatement' | 'BinaryExpression' | 'Literal'

export interface Node {
  readonly type: NodeType
}

export interface Literal extends Node {
  type: 'Literal'
  value: string | boolean | null | number
}

export interface BinaryExpression extends Node {
  type: 'BinaryExpression'
  left: BinaryExpression | Literal
  operator: string
  right: BinaryExpression | Literal
}

export interface ExpressionStatement extends Node {
  type: 'ExpressionStatement'
  expression: BinaryExpression
}

export interface AST extends Node {
  type: 'Program'
  body: (ExpressionStatement | BinaryExpression)[]
}
