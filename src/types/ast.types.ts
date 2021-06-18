export type NodeType =
  | 'Program'
  | 'ExpressionStatement'
  | 'UnaryExpression'
  | 'BinaryExpression'
  | 'Literal'
  | 'Identifier'
  | 'VariableDeclarator'
  | 'VariableDeclaration'
  | 'AssignmentExpression'
  | 'MemberExpression'
  | 'CallExpression'

export interface Node {
  readonly type: NodeType
}

export interface Literal extends Node {
  readonly type: 'Literal'
  value: string | boolean | null | number
}

export interface Identifier extends Node {
  readonly type: 'Identifier'
  name: string
}

export interface VariableDeclarator extends Node {
  readonly type: 'VariableDeclarator'
  id: Identifier
  init: UnaryExpression | BinaryExpression | Literal
}

export interface VariableDeclaration extends Node {
  readonly type: 'VariableDeclaration'
  declarations: VariableDeclarator[]
  kind: 'let'
}

export interface UnaryExpression extends Node {
  readonly type: 'UnaryExpression'
  operator: string
  argument: Literal
}

export interface BinaryExpression extends Node {
  readonly type: 'BinaryExpression'
  left: UnaryExpression | BinaryExpression | Literal
  operator: string
  right: UnaryExpression | BinaryExpression | Literal
}

export interface ExpressionStatement extends Node {
  readonly type: 'ExpressionStatement'
  expression: CallExpression | BinaryExpression | UnaryExpression | AssignmentExpression
}

export interface AssignmentExpression extends Node {
  readonly type: 'AssignmentExpression'
  left: Identifier
  operator: '='
  right: UnaryExpression | BinaryExpression | Literal
}

export interface MemberExpression extends Node {
  readonly type: 'MemberExpression'
  object: MemberExpression | Identifier
  property: Identifier
}

export interface CallExpression extends Node {
  readonly type: 'CallExpression'
  callee: MemberExpression
  arguments: (
    | UnaryExpression
    | BinaryExpression
    | CallExpression
    | AssignmentExpression
    | Identifier
    | Literal
  )[]
}

export interface AST extends Node {
  readonly type: 'Program'
  body: (ExpressionStatement | BinaryExpression | UnaryExpression)[]
}
