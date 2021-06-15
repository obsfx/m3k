import { NodeType, Node } from './ast.types'

export interface VisitorMethods {
  enter: (node: Node, parent: Node) => void
  exit: (node: Node, parent: Node) => void
}

export type Visitor = Record<NodeType, VisitorMethods>
