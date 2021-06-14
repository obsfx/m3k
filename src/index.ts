import { tokenize, Token } from './tokenizer'
import { parse } from './parser'

const test = `(+ 5 (* 4 12 51 (- 25 12)))`

// console.log(test)
//
// setTimeout(() => {
//   //console.log(tokens)
//   console.log(parse(tokens))
// }, 1000)
//
// setInterval(() => {})

const tokens: Token[] = tokenize(test)
console.log(tokens)
console.log(parse(tokens))
