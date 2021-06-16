import { Token } from './types/token.types'
import { AST } from './types/ast.types'

import { tokenize } from './tokenizer'
import { parse } from './parser'
import { transform } from './transformer'
import { generate } from './code-generator'

import { debugAST } from './ast-debugger'

const test = `(- 1 (+ 45 12 41))`

// console.log(test)
//
// setTimeout(() => {
//   //console.log(tokens)
//   console.log(parse(tokens))
// }, 1000)
//
// setInterval(() => {})

const run = () => {
  console.log(`input: `, test)
  console.log('-------------------')
  const tokens: Token[] = tokenize(test)
  const ast: AST = parse(tokens)
  const transformedAST: AST = transform(ast)
  debugAST(transformedAST)
  const code: string = generate(transformedAST)
  console.log(code)
}

run()
