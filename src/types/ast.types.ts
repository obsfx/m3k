/**
 * Mostly implemented with the guidance of here
 * https://github.com/estree/estree
 */

export type NodeType =
  | 'Program'
  | 'ExpressionStatement'
  | 'UnaryExpression'
  | 'BinaryExpression'
  | 'AssignmentExpression'
  | 'MemberExpression'
  | 'CallExpression'
  | 'ArrayExpression'
  | 'ObjectExpression'
  | 'VariableDeclarator'
  | 'VariableDeclaration'
  | 'SpreadElement'
  | 'Property'
  | 'Identifier'
  | 'Literal'

export type GeneralType = 'Node' | 'Expression' | 'Statement' | 'Declaration'

//export type InnerNode =
//  | MemberExpression
//  | ArrayExpression
//  | ObjectExpression
//  | UnaryExpression
//  | BinaryExpression
//  | CallExpression
//  | AssignmentExpression
//  | Identifier
//  | Literal

/**
 * Nodes
 */
export interface Node {
  readonly generaltype: GeneralType
  readonly type: NodeType
}

export interface VariableDeclarator extends Node {
  readonly type: 'VariableDeclarator'
  id: Identifier
  init: Expression
}

export interface Property extends Node {
  readonly type: 'Property'
  key: Identifier | Literal
  value: Expression
}

export interface SpreadElement extends Node {
  type: 'SpreadElement'
  argument: Expression
}

export interface AST extends Node {
  readonly type: 'Program'
  body: Statement[]
}

/**
 * Expressions
 */
export interface Expression extends Node {
  readonly generaltype: 'Expression'
}

export type AssignmentOperator =
  | '='
  | '+='
  | '-='
  | '*='
  | '/='
  | '%='
  | '<<='
  | '>>='
  | '>>>='
  | '|='
  | '^='
  | '&='

export interface AssignmentExpression extends Expression {
  readonly type: 'AssignmentExpression'
  operator: AssignmentOperator
  left: Expression
  right: Expression
}

export interface MemberExpression extends Expression {
  readonly type: 'MemberExpression'
  object: Expression
  property: Expression
}

export interface CallExpression extends Expression {
  readonly type: 'CallExpression'
  callee: MemberExpression
  arguments: (Expression | SpreadElement)[]
}

export interface ObjectExpression extends Expression {
  readonly type: 'ObjectExpression'
  properties: Property[]
}

export interface ArrayExpression extends Expression {
  readonly type: 'ArrayExpression'
  elements: (Expression | SpreadElement)[]
}

export type UnaryOperator = '-' | '+' | '!' | '~' | 'typeof' | 'void' | 'delete'

export interface UnaryExpression extends Expression {
  readonly type: 'UnaryExpression'
  operator: UnaryOperator
  argument: Expression
}

export type BinaryOperator =
  | '=='
  | '!='
  | '==='
  | '!=='
  | '<'
  | '<='
  | '>'
  | '>='
  | '<<'
  | '>>'
  | '>>>'
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '|'
  | '^'
  | '&'
  | 'in'
  | 'instanceof'

export interface BinaryExpression extends Expression {
  readonly type: 'BinaryExpression'
  operator: BinaryOperator
  left: Expression
  right: Expression
}

export interface Literal extends Expression {
  readonly type: 'Literal'
  value: string | boolean | null | number
}

export interface Identifier extends Expression {
  readonly type: 'Identifier'
  name: string
}

/**
 * Statements
 */
export interface Statement extends Node {
  readonly generaltype: 'Statement' | 'Declaration'
}

export interface ExpressionStatement extends Statement {
  readonly type: 'ExpressionStatement'
  expression: Expression
}

/**
 * Declarations
 */
export interface Declaration extends Statement {
  readonly generaltype: 'Declaration'
}

export interface VariableDeclaration extends Declaration {
  readonly type: 'VariableDeclaration'
  declarations: VariableDeclarator[]
  kind: 'let'
}
