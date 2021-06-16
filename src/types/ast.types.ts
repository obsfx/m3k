export type NodeType =
  | 'Program'
  | 'ExpressionStatement'
  | 'UnaryExpression'
  | 'BinaryExpression'
  | 'Literal'
  | 'Identifier'
  | 'VariableDeclarator'
  | 'VariableDeclaration'

export interface Node {
  readonly type: NodeType
}

export interface Literal extends Node {
  type: 'Literal'
  value: string | boolean | null | number
}

export interface Identifier extends Node {
  type: 'Identifier'
  name: string
}

export interface VariableDeclarator extends Node {
  type: 'VariableDeclarator'
  id: Identifier
  init: UnaryExpression | BinaryExpression | Literal
}

export interface VariableDeclaration extends Node {
  type: 'VariableDeclaration'
  declarations: VariableDeclarator[]
  kind: 'let'
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
