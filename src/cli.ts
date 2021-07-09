import * as fs from 'fs'

import { tokenize } from './tokenizer'
import { parse } from './parser'
import { transform } from './transformer'
import { generate } from './code-generator'
import { Token } from './types/token.types'
import { AST } from './types/ast.types'

const argv: string[] = process.argv.slice(2)
const [input] = argv

if (!input) {
  console.log(`Please specify the input file\n  usage: m3k input.lisp`)
  process.exit(1)
}

if (!fs.existsSync(input)) {
  console.log(`Input file couldn't found\n  usage: m3k input.lisp`)
  process.exit(1)
}

const text: string = fs.readFileSync(input, 'utf8')
const tokens: Token[] = tokenize(text)
const ast: AST = parse(tokens)
const transformed: AST = transform(ast)
const code: string = generate(transformed)

const fileName = `${input.split('.').slice(0, -1).join('')}.js`
fs.writeFileSync(fileName, code)
console.log(`compiled: ${fileName}`)
