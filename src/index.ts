import { Token } from './types/token.types'
import { AST } from './types/ast.types'

import { tokenize } from './tokenizer'
import { parse } from './parser'
import { traverse } from './traverser'
import debugVisitor from './debug-visitor'

const test = `(+ 5 (* 4 12) 5) (+ 12 (- 5 4))`

// console.log(test)
//
// setTimeout(() => {
//   //console.log(tokens)
//   console.log(parse(tokens))
// }, 1000)
//
// setInterval(() => {})

const run = () => {
  const tokens: Token[] = tokenize(test)
  const ast: AST = parse(tokens)

  console.log(test)

  traverse(ast, debugVisitor)
}

run()
