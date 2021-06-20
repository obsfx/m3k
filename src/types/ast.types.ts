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
  | 'ArrayExpression'
  | 'SpreadElement'

export type InnerNode =
  | MemberExpression
  | ArrayExpression
  | UnaryExpression
  | BinaryExpression
  | CallExpression
  | AssignmentExpression
  | Identifier
  | Literal

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
  expression:
    | CallExpression
    | ArrayExpression
    | BinaryExpression
    | UnaryExpression
    | AssignmentExpression
}

export interface AssignmentExpression extends Node {
  readonly type: 'AssignmentExpression'
  left: MemberExpression | Identifier
  operator: '='
  right: InnerNode
}

export interface MemberExpression extends Node {
  readonly type: 'MemberExpression'
  object: MemberExpression | CallExpression | ArrayExpression | Identifier | Literal
  property: InnerNode
}

export interface CallExpression extends Node {
  readonly type: 'CallExpression'
  callee: MemberExpression
  arguments: InnerNode[]
}

export interface ArrayExpression extends Node {
  readonly type: 'ArrayExpression'
  elements: (InnerNode | SpreadElement)[]
}

export interface SpreadElement extends Node {
  type: 'SpreadElement'
  argument: MemberExpression | CallExpression | ArrayExpression | Identifier
}

export interface AST extends Node {
  readonly type: 'Program'
  body: Node[]
}
