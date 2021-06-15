import { Node, BinaryExpression, Literal } from './types/ast.types'
import { Visitor } from './types/visitor.types'

let depth: number = 0

const debugVisitor: Visitor = {
  Program: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  BinaryExpression: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type} ${(node as BinaryExpression).operator}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },

  Literal: {
    enter: (node: Node) => {
      console.log(`${' '.repeat(depth * 2)}${node.type} ${(node as Literal).raw}`)
      depth++
    },
    exit: () => {
      depth--
    },
  },
}

export default debugVisitor
