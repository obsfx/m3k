export type NodeType = 'Program' | 'BinaryExpression' | 'Literal'

export interface Node {
  readonly type: NodeType
}

export interface Literal extends Node {
  type: 'Literal'
  raw: string | number
}

export interface BinaryExpression extends Node {
  type: 'BinaryExpression'
  left: BinaryExpression | Literal
  operator: string
  right: BinaryExpression | Literal
}

export interface AST extends Node {
  type: 'Program'
  body: BinaryExpression[]
}
