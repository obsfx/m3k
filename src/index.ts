import { tokenize } from './tokenizer'
import { parse } from './parser'
import { transform } from './transformer'
import { generate } from './code-generator'

export = {
  tokenize,
  parse,
  transform,
  generate,
}
