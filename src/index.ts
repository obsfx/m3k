import { Token } from './types/token.types'
import { AST } from './types/ast.types'

import { tokenize } from './tokenizer'
import { parse } from './parser'
import { transform } from './transformer'
import { generate } from './code-generator'

// import { debugAST } from './ast-debugger'

const test = `
(define r 5)
(define degisken-falan 20)
(- 1 (+ r degisken-falan))
(set! r 300)
(define test "deneme text")
(define result (+ r r (* 15 degisken-falan)))
(define text-result (+ test test))
(print "test" test result)
(set! result "result text")
(print result)
(define arr (list 5 4 3 5 (set! r 500) (list "test" 42 (list 74))))
(print arr)
(print (nth 2 (list 42 "deneme arr" "test")))
(print (nth 4 arr))
(print (nth (nth 1 arr) arr))
(print "array example")
(print (nth (nth 2 (list 1 2 3)) (list 0 0 0 3 0 0)))
(set! (nth 2 arr) "set array")
(print (nth 2 arr))
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
  //debugAST(transformedAST)
  const code: string = generate(transformedAST)
  console.log(code)
  console.log('-------------------')
  eval(code)
}

run()
