import { Token } from './types/token.types'
import { AST } from './types/ast.types'

import { tokenize } from './tokenizer'
import { parse } from './parser'
import { transform } from './transformer'
import { generate } from './code-generator'

//import { debugAST } from './ast-debugger'

let test = ''

test += `
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
  (set! arr (list 1 2 3 4))
  (print arr)
  (set! arr (append arr (list 5 6 7 8)))
  (print arr)
  (push arr 5 125 151 (list 4 10 15))
  (unshift arr 5 125 151 (list 4 10 15))
  (push (list 15 20 (list 250 5 4)) 5 125 151 (list 4 10 15))
  (pop arr)
  (print (pop (list 15 20 (list 250 5 4))))
  (print (shift (list 15 20 (list 250 5 4))))
  (print (length (reverse (append (list) (list 15 20 (list 250 5 4))))))
  (define arr2 (reverse (append (list) (list 15 20 (list 250 5 4)))))
  (print arr2)
  (print (includes arr2 15))
  (define arr3 (list 0 0 0 0 0))
  (fill arr3 3)
  (print arr3)
  (print (concat arr3 arr2))
  (print (join arr3 ", "))
  (define arr4 (list 1 2 3 4 5 6))
  (print arr4)
  (splice arr4 2 1)
  (print arr4)
  (print (nth (- (length arr4) 1) arr4))
 `

test += `
(define obj
  (dict
   :entry-one "test"
   :entry-two "test2"
   :entry-three (dict :test-entry "test3"
                )
  )
)

(set! (getval new-field (getval entry-three obj)) "test")
(print (getval new-field (getval entry-three obj)))


(define fn (defun (text) (print text)))
(set! fn (defun (text) (print text)))

(fn "deneme deneme")

(define add
 (defun (a b c d)
  (progn
   (define y (* a b c d))
   (print "sonuç:" y))))

(add 2 2 2 2)

(define arr5 (map arr4 (defun (el index) (+ el index))))
(print arr5)

(if 1
 (progn
  (define res (add 1 1 2 2))
  (print res))
 (print "test2"))
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
