import { Token } from './types/token.types'
import { AST } from './types/ast.types'

import { tokenize } from './tokenizer'
import { parse } from './parser'
import { transform } from './transformer'
import { generate } from './code-generator'

import { debugAST } from './ast-debugger'

const test = `
(define r 5)
(define degisken-falan 20)
(- 1 (+ r degisken-falan))
`

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
  //console.log(tokens)
  //console.log('-------------------')
  const ast: AST = parse(tokens)
  //console.log(ast)
  //console.log('-------------------')
  const transformedAST: AST = transform(ast)
  debugAST(transformedAST)
  const code: string = generate(transformedAST)
  console.log(code)
}

run()
