import { tokenize } from './tokenizer'
import { parse } from './parser'
import { transform } from './transformer'
import { generate } from './code-generator'

module.exports = {
  tokenize,
  parse,
  transform,
  generate,
}
