export type NodeType =
  | 'Program'
  | 'ExpressionStatement'
  | 'UnaryExpression'
  | 'BinaryExpression'
  | 'Literal'

export interface Node {
  readonly type: NodeType
}

export interface Literal extends Node {
  type: 'Literal'
  value: string | boolean | null | number
}

export interface UnaryExpression extends Node {
  type: 'UnaryExpression'
  operator: string
  argument: Literal
}

export interface BinaryExpression extends Node {
  type: 'BinaryExpression'
  left: UnaryExpression | BinaryExpression | Literal
  operator: string
  right: UnaryExpression | BinaryExpression | Literal
}

export interface ExpressionStatement extends Node {
  type: 'ExpressionStatement'
  expression: BinaryExpression | UnaryExpression
}

export interface AST extends Node {
  type: 'Program'
  body: (ExpressionStatement | BinaryExpression | UnaryExpression)[]
}
