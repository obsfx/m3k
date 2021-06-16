import { Token } from './types/token.types'
import { AST } from './types/ast.types'

import { tokenize } from './tokenizer'
import { parse } from './parser'
import { transform } from './transformer'
import { generate } from './code-generator'

//import { debugAST } from './ast-debugger'

const test = `(+ 5 15 (* 4 21 15 21 45 71 (/ 47 12 5))) (+ 45 12)`

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
  const code: string = generate(transformedAST)
  console.log(code)
}

run()
