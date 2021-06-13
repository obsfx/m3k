import { tokenize } from './tokenizer'

const test = `(+ 5 3 (* 4 12))`

console.log(tokenize(test))
