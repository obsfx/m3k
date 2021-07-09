(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.m3k = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const generate = (node) => {
    switch (node.type) {
        case 'Program':
            return node.body.map(exports.generate).join('');
        case 'BlockStatement': {
            let lastNode = undefined;
            const lastElement = node.body[node.body.length - 1];
            if (lastElement &&
                lastElement.type === 'ExpressionStatement' &&
                lastElement.expression.type !== 'AssignmentExpression') {
                lastNode = node.body.pop();
            }
            return `{${node.body.map(exports.generate).join('')}${lastNode ? ` return ${exports.generate(lastNode)}` : ''}}`;
        }
        case 'IfStatement':
            return `if (${exports.generate(node.test)}) ${exports.generate(node.consequent)} ${node.alternate
                ? `else ${exports.generate(node.alternate)}`
                : ''}`;
        case 'VariableDeclaration':
            return `${node.kind} ${node.declarations
                .map(exports.generate)
                .join('')};`;
        case 'VariableDeclarator':
            return `${exports.generate(node.id)} = ${exports.generate(node.init)}`;
        case 'Identifier':
            return `${node.name
                .split('-')
                .map((e, i) => (i === 0 ? e : `${e[0].toUpperCase()}${e.slice(1)}`))
                .join('')}`;
        case 'ExpressionStatement':
            return `${exports.generate(node.expression)};`;
        case 'AssignmentExpression':
            return `${exports.generate(node.left)} ${node.operator} ${exports.generate(node.right)}`;
        case 'CallExpression': {
            if (node.callee.type === 'ArrowFunctionExpression') {
                return `(${exports.generate(node.callee)})(${node.arguments
                    .map(exports.generate)
                    .join(', ')})`;
            }
            else {
                return `${exports.generate(node.callee)}(${node.arguments
                    .map(exports.generate)
                    .join(', ')})`;
            }
        }
        case 'ArrayExpression':
            return `[${node.elements.map(exports.generate).join(', ')}]`;
        case 'ArrowFunctionExpression': {
            if (node.body.type !== 'BlockStatement') {
                return `(${node.params
                    .map(exports.generate)
                    .join(', ')}) => (${exports.generate(node.body)})`;
            }
            else {
                return `(${node.params
                    .map(exports.generate)
                    .join(', ')}) => ${exports.generate(node.body)}`;
            }
        }
        case 'MemberExpression': {
            if (node.property.type === 'Identifier') {
                return `${exports.generate(node.object)}.${exports.generate(node.property)}`;
            }
            else {
                return `${exports.generate(node.object)}[${exports.generate(node.property)}]`;
            }
        }
        case 'ObjectExpression':
            return `{${node.properties.map(exports.generate).join(', ')}}`;
        case 'Property':
            return `${exports.generate(node.key)}: ${exports.generate(node.value)}`;
        case 'BinaryExpression':
            return `${exports.generate(node.left)} ${node.operator} ${exports.generate(node.right)}`;
        case 'UnaryExpression':
            return `${node.operator}${exports.generate(node.argument)}`;
        case 'SpreadElement':
            return `...${exports.generate(node.argument)}`;
        case 'Literal':
            return `${node.value}`;
        default:
            throw new Error(`Undefined AST node: ${node.type}`);
    }
};
exports.generate = generate;

},{}],2:[function(require,module,exports){
"use strict";
const tokenizer_1 = require("./tokenizer");
const parser_1 = require("./parser");
const transformer_1 = require("./transformer");
const code_generator_1 = require("./code-generator");
module.exports = {
    tokenize: tokenizer_1.tokenize,
    parse: parser_1.parse,
    transform: transformer_1.transform,
    generate: code_generator_1.generate,
};

},{"./code-generator":1,"./parser":3,"./tokenizer":4,"./transformer":5}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const token_types_1 = require("./types/token.types");
const parse = (tokens) => {
    const ast = {
        generaltype: 'Node',
        type: 'Program',
        body: [],
    };
    let current = 0;
    let line = 0;
    const definedIdentifiers = [];
    const consume = () => {
        return tokens[current++] || null;
    };
    const peek = (offet = 0) => {
        return tokens[current + offet];
    };
    const seekForToken = (type) => {
        let idx = current;
        while (idx < tokens.length) {
            if (type === tokens[idx].type) {
                return true;
            }
            else if (tokens[idx].type !== token_types_1.TokenType.NEWLINE) {
                return false;
            }
            idx++;
        }
        return false;
    };
    const consumeUntil = (type, include = true) => {
        while (current < tokens.length && peek().type !== type) {
            consume();
        }
        if (include) {
            consume();
        }
    };
    const before = (offet = 0) => {
        return tokens[current - 2 + offet];
    };
    const constructBinaryExpressions = (params, operator) => {
        const right = params.pop();
        const left = params.length === 0
            ? null
            : params.length === 1
                ? params.pop()
                : constructBinaryExpressions(params, operator);
        // FIXME: operator type consistency
        if (!right) {
            throw new Error(`Line ${line + 1}: Missing binary expression operands`);
        }
        if (right.generaltype !== 'Expression') {
            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
        }
        if (!left) {
            if (operator !== '!' && operator !== '+' && operator !== '-') {
                throw new Error(`Line ${line + 1}: Unexpected token: ${operator}`);
            }
            const node = {
                generaltype: 'Expression',
                type: 'UnaryExpression',
                operator: operator,
                argument: right,
            };
            return node;
        }
        else if (operator === '!') {
            throw new Error(`Line ${line + 1}: Unexpected token: ${operator}`);
        }
        if (left.generaltype !== 'Expression') {
            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
        }
        const node = {
            generaltype: 'Expression',
            type: 'BinaryExpression',
            operator: operator,
            left: left,
            right: right,
        };
        return node;
    };
    const checkOpeningParen = () => {
        if (!before() || before().type !== token_types_1.TokenType.OPEN_PAREN) {
            throw new Error(`Line ${line + 1}: Syntax error: Please check the paranthesis openings`);
        }
    };
    const walk = () => {
        const token = consume();
        if (!token) {
            return null;
        }
        switch (token.type) {
            case token_types_1.TokenType.OPEN_PAREN: {
                if (seekForToken(token_types_1.TokenType.OPEN_PAREN)) {
                    const callee = walk();
                    if (!callee) {
                        throw new Error(`Line ${line + 1}: Missing binary expression operands`);
                    }
                    if (callee.generaltype !== 'Expression') {
                        throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                    }
                    if (callee.type !== 'MemberExpression' && callee.type !== 'Identifier') {
                        throw Error(`Line ${line + 1}: Incorrect expression`);
                    }
                    const args = [];
                    while (!seekForToken(token_types_1.TokenType.CLOSE_PAREN)) {
                        const arg = walk();
                        if (!arg) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (arg.generaltype === 'Declaration') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        args.push(arg);
                        if (!peek()) {
                            throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`);
                        }
                    }
                    const node = {
                        generaltype: 'Expression',
                        type: 'CallExpression',
                        callee,
                        arguments: args,
                    };
                    // consume the close paren
                    consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                    return node;
                }
                const node = walk();
                return node;
            }
            case token_types_1.TokenType.STRING:
            case token_types_1.TokenType.NUMBER: {
                const node = {
                    generaltype: 'Expression',
                    type: 'Literal',
                    value: token.value,
                };
                return node;
            }
            case token_types_1.TokenType.NEWLINE: {
                line += 1;
                const node = walk();
                return node;
            }
            case token_types_1.TokenType.EQUAL:
            case token_types_1.TokenType.GREATER:
            case token_types_1.TokenType.GREATER_EQUAL:
            case token_types_1.TokenType.LESS:
            case token_types_1.TokenType.LESS_EQUAL:
            case token_types_1.TokenType.BANG:
            case token_types_1.TokenType.BANG_EQUAL:
            case token_types_1.TokenType.MODULO:
            case token_types_1.TokenType.PLUS:
            case token_types_1.TokenType.MINUS:
            case token_types_1.TokenType.STAR:
            case token_types_1.TokenType.SLASH: {
                checkOpeningParen();
                const operator = token.value.toString();
                const params = [];
                while (!seekForToken(token_types_1.TokenType.CLOSE_PAREN)) {
                    const param = walk();
                    if (!param) {
                        throw new Error(`Line ${line + 1}: Node is null`);
                    }
                    if (param.generaltype !== 'Expression') {
                        throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                    }
                    params.push(param);
                    if (!peek()) {
                        throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`);
                    }
                }
                const node = constructBinaryExpressions(params, operator);
                // consume the close paren
                consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                return node;
            }
            case token_types_1.TokenType.IDENTIFIER: {
                switch (token.value.toString()) {
                    case 'define': {
                        checkOpeningParen();
                        if (peek().type !== token_types_1.TokenType.IDENTIFIER) {
                            throw new Error(`Line ${line + 1}: Unexpected token: ${peek().type}`);
                        }
                        const idToken = consume();
                        if (!idToken) {
                            throw new Error(`Line ${line + 1}: Token is null`);
                        }
                        const name = idToken.value.toString();
                        if (definedIdentifiers.includes(name)) {
                            throw new Error(`Line ${line + 1}: ${name} is already defined.`);
                        }
                        const id = {
                            generaltype: 'Expression',
                            type: 'Identifier',
                            name,
                        };
                        const init = walk();
                        if (!init) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (init.generaltype !== 'Expression') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        const declarations = {
                            generaltype: 'Node',
                            type: 'VariableDeclarator',
                            id,
                            init,
                        };
                        const node = {
                            generaltype: 'Declaration',
                            type: 'VariableDeclaration',
                            declarations: [declarations],
                            kind: 'let',
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        definedIdentifiers.push(name);
                        return node;
                    }
                    case 'set!': {
                        checkOpeningParen();
                        const left = walk();
                        if (!left) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (left.generaltype !== 'Expression') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        if (left.type !== 'MemberExpression' && left.type !== 'Identifier') {
                            throw new Error(`Line ${line + 1}: Unexpected token: ${left.type}`);
                        }
                        const right = walk();
                        if (!right) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (right.generaltype !== 'Expression') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        const node = {
                            generaltype: 'Expression',
                            type: 'AssignmentExpression',
                            operator: '=',
                            left,
                            right,
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'print': {
                        checkOpeningParen();
                        const object = {
                            generaltype: 'Expression',
                            type: 'Identifier',
                            name: 'console',
                        };
                        const property = {
                            generaltype: 'Expression',
                            type: 'Identifier',
                            name: 'log',
                        };
                        const callee = {
                            generaltype: 'Expression',
                            type: 'MemberExpression',
                            object,
                            property,
                        };
                        const args = [];
                        while (!seekForToken(token_types_1.TokenType.CLOSE_PAREN)) {
                            const arg = walk();
                            if (!arg) {
                                throw new Error(`Line ${line + 1}: Node is null`);
                            }
                            if (arg.generaltype === 'Declaration') {
                                throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                            }
                            args.push(arg);
                            if (!peek()) {
                                throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`);
                            }
                        }
                        if (args.length === 0) {
                            throw Error(`Line ${line + 1}: "print": You must pass one or more arguments`);
                        }
                        const node = {
                            generaltype: 'Expression',
                            type: 'CallExpression',
                            callee,
                            arguments: args,
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'list': {
                        checkOpeningParen();
                        const elements = [];
                        while (!seekForToken(token_types_1.TokenType.CLOSE_PAREN)) {
                            const element = walk();
                            if (!element) {
                                throw new Error(`Line ${line + 1}: Node is null`);
                            }
                            if (element.generaltype === 'Declaration') {
                                throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                            }
                            elements.push(element);
                            if (!peek()) {
                                throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`);
                            }
                        }
                        const node = {
                            generaltype: 'Expression',
                            type: 'ArrayExpression',
                            elements,
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'nth': {
                        checkOpeningParen();
                        const property = walk();
                        if (!property) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (property.generaltype !== 'Expression') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        const object = walk();
                        if (!object) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (object.generaltype !== 'Expression') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        const node = {
                            generaltype: 'Expression',
                            type: 'MemberExpression',
                            object,
                            property,
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'append': {
                        checkOpeningParen();
                        const elements = [];
                        while (!seekForToken(token_types_1.TokenType.CLOSE_PAREN)) {
                            const arg = walk();
                            if (!arg) {
                                throw new Error(`Line ${line + 1}: Node is null`);
                            }
                            if (arg.generaltype !== 'Expression') {
                                throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                            }
                            const spreadElement = {
                                generaltype: 'Node',
                                type: 'SpreadElement',
                                argument: arg,
                            };
                            elements.push(spreadElement);
                            if (!peek()) {
                                throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`);
                            }
                        }
                        const node = {
                            generaltype: 'Expression',
                            type: 'ArrayExpression',
                            elements,
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'unshift':
                    case 'map':
                    case 'for-each':
                    case 'filter':
                    case 'find':
                    case 'reduce':
                    case 'push':
                    case 'includes':
                    case 'concat':
                    case 'join':
                    case 'slice':
                    case 'splice': {
                        checkOpeningParen();
                        const object = walk();
                        if (!object) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (object.generaltype !== 'Expression') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        const property = {
                            generaltype: 'Expression',
                            type: 'Identifier',
                            name: token.value.toString(),
                        };
                        const callee = {
                            generaltype: 'Expression',
                            type: 'MemberExpression',
                            object,
                            property,
                        };
                        const args = [];
                        while (!seekForToken(token_types_1.TokenType.CLOSE_PAREN)) {
                            const arg = walk();
                            if (!arg) {
                                throw new Error(`Line ${line + 1}: Node is null`);
                            }
                            if (arg.generaltype === 'Declaration') {
                                throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                            }
                            args.push(arg);
                            if (!peek()) {
                                throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`);
                            }
                        }
                        const node = {
                            generaltype: 'Expression',
                            type: 'CallExpression',
                            callee,
                            arguments: args,
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'shift':
                    case 'pop':
                    case 'reverse': {
                        checkOpeningParen();
                        const object = walk();
                        if (!object) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (object.generaltype !== 'Expression') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        const property = {
                            generaltype: 'Expression',
                            type: 'Identifier',
                            name: token.value.toString(),
                        };
                        const callee = {
                            generaltype: 'Expression',
                            type: 'MemberExpression',
                            object,
                            property,
                        };
                        const node = {
                            generaltype: 'Expression',
                            type: 'CallExpression',
                            callee,
                            arguments: [],
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'length': {
                        checkOpeningParen();
                        const object = walk();
                        if (!object) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (object.generaltype !== 'Expression') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        const property = {
                            generaltype: 'Expression',
                            type: 'Identifier',
                            name: 'length',
                        };
                        const node = {
                            generaltype: 'Expression',
                            type: 'MemberExpression',
                            object,
                            property,
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'dict': {
                        checkOpeningParen();
                        const properties = [];
                        while (!seekForToken(token_types_1.TokenType.CLOSE_PAREN)) {
                            const key = walk();
                            if (!key) {
                                throw new Error(`Line ${line + 1}: Node is null`);
                            }
                            if (key.generaltype !== 'Expression') {
                                throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                            }
                            if (key.type !== 'Identifier' && key.name[0] !== ':') {
                                throw new Error(`Line ${line + 1}: Incorrect dict key`);
                            }
                            ;
                            key.name = key.name.slice(1);
                            const value = walk();
                            if (!value) {
                                throw new Error(`Line ${line + 1}: Node is null`);
                            }
                            if (value.generaltype !== 'Expression') {
                                throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                            }
                            const property = {
                                generaltype: 'Node',
                                type: 'Property',
                                key,
                                value,
                            };
                            properties.push(property);
                            if (!peek()) {
                                throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`);
                            }
                        }
                        const node = {
                            generaltype: 'Expression',
                            type: 'ObjectExpression',
                            properties,
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'getval': {
                        checkOpeningParen();
                        const property = walk();
                        if (!property) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (property.generaltype !== 'Expression') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        if (property.type !== 'Identifier') {
                            throw new Error(`Line ${line + 1}: Incorrect dict key`);
                        }
                        const object = walk();
                        if (!object) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (object.generaltype !== 'Expression') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        //if (object.type !== 'Identifier' && object.type !== 'MemberExpression') {
                        //  throw new Error(`Line ${line + 1}: Incorrect dict key`)
                        //}
                        const node = {
                            generaltype: 'Expression',
                            type: 'MemberExpression',
                            object,
                            property,
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'defun': {
                        checkOpeningParen();
                        consumeUntil(token_types_1.TokenType.OPEN_PAREN);
                        const params = [];
                        while (!seekForToken(token_types_1.TokenType.CLOSE_PAREN)) {
                            const param = walk();
                            if (!param) {
                                throw new Error(`Line ${line + 1}: Node is null`);
                            }
                            if (param.type !== 'Identifier') {
                                throw new Error(`Line ${line + 1}: Incorrect function parameter`);
                            }
                            params.push(param);
                        }
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        consumeUntil(token_types_1.TokenType.OPEN_PAREN);
                        const body = walk();
                        if (!body) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        const node = {
                            generaltype: 'Expression',
                            type: 'ArrowFunctionExpression',
                            params,
                            body,
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'progn': {
                        checkOpeningParen();
                        const blockBody = [];
                        while (!seekForToken(token_types_1.TokenType.CLOSE_PAREN)) {
                            const node = walk();
                            if (!node) {
                                throw new Error(`Line ${line + 1}: Node is null`);
                            }
                            blockBody.push(node);
                        }
                        const body = {
                            generaltype: 'Statement',
                            type: 'BlockStatement',
                            body: blockBody,
                        };
                        if (!body) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        const callee = {
                            generaltype: 'Expression',
                            type: 'ArrowFunctionExpression',
                            params: [],
                            body,
                        };
                        const node = {
                            generaltype: 'Expression',
                            type: 'CallExpression',
                            callee,
                            arguments: [],
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    case 'if': {
                        checkOpeningParen();
                        const test = walk();
                        if (!test) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        if (test.generaltype !== 'Expression') {
                            throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                        }
                        const consequentBody = walk();
                        if (!consequentBody) {
                            throw new Error(`Line ${line + 1}: Node is null`);
                        }
                        const consequent = {
                            generaltype: 'Statement',
                            type: 'BlockStatement',
                            body: [consequentBody],
                        };
                        let alternate = null;
                        if (!seekForToken(token_types_1.TokenType.CLOSE_PAREN)) {
                            const alternateBody = walk();
                            if (!alternateBody) {
                                throw new Error(`Line ${line + 1}: Node is null`);
                            }
                            alternate = {
                                generaltype: 'Statement',
                                type: 'BlockStatement',
                                body: [alternateBody],
                            };
                        }
                        const arrowBlockBody = {
                            generaltype: 'Statement',
                            type: 'IfStatement',
                            test,
                            consequent,
                            alternate,
                        };
                        const arrowBody = {
                            generaltype: 'Statement',
                            type: 'BlockStatement',
                            body: [arrowBlockBody],
                        };
                        const callee = {
                            generaltype: 'Expression',
                            type: 'ArrowFunctionExpression',
                            body: arrowBody,
                            params: [],
                        };
                        const node = {
                            generaltype: 'Expression',
                            type: 'CallExpression',
                            callee,
                            arguments: [],
                        };
                        // consume the close paren
                        consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                        return node;
                    }
                    default: {
                        if (before() &&
                            before().type === token_types_1.TokenType.OPEN_PAREN &&
                            before(-1) &&
                            before(-1).value !== 'defun') {
                            const callee = {
                                generaltype: 'Expression',
                                type: 'Identifier',
                                name: token.value.toString(),
                            };
                            const args = [];
                            while (!seekForToken(token_types_1.TokenType.CLOSE_PAREN)) {
                                const arg = walk();
                                if (!arg) {
                                    throw new Error(`Line ${line + 1}: Node is null`);
                                }
                                if (arg.generaltype === 'Declaration') {
                                    throw new Error(`Line ${line + 1}: Definition in expression context, where definitions are not allowed`);
                                }
                                args.push(arg);
                                if (!peek()) {
                                    throw new Error(`Line ${line + 1}: Syntax error: Unclosed paranthesis`);
                                }
                            }
                            const node = {
                                generaltype: 'Expression',
                                type: 'CallExpression',
                                callee,
                                arguments: args,
                            };
                            // consume the close paren
                            consumeUntil(token_types_1.TokenType.CLOSE_PAREN);
                            return node;
                        }
                        // if (definedIdentifiers.includes(token.value.toString())) {
                        const id = {
                            generaltype: 'Expression',
                            type: 'Identifier',
                            name: token.value.toString(),
                        };
                        return id;
                        // }
                        //throw new Error(`Line ${line + 1}: Undefined identifier: ${token.value}`)
                    }
                }
            }
            default:
                throw new Error(`Line ${line + 1}: Undefined token: ${token.value}`);
        }
    };
    while (current < tokens.length) {
        const node = walk();
        if (node) {
            ast.body.push(node);
        }
    }
    return ast;
};
exports.parse = parse;

},{"./types/token.types":7}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = void 0;
const token_types_1 = require("./types/token.types");
const tokenize = (input) => {
    const tokens = [];
    let current = 0;
    const isEnd = () => {
        return current >= input.length;
    };
    const consume = () => {
        return input[current++];
    };
    const peek = () => {
        if (isEnd()) {
            return '\0';
        }
        return input[current];
    };
    while (current < input.length) {
        const char = consume();
        switch (char) {
            case '(':
                tokens.push({ type: token_types_1.TokenType.OPEN_PAREN, value: '(' });
                break;
            case ')':
                tokens.push({ type: token_types_1.TokenType.CLOSE_PAREN, value: ')' });
                break;
            case '-':
                tokens.push({ type: token_types_1.TokenType.MINUS, value: '-' });
                break;
            case '+':
                if (peek() !== ' ') {
                    throw new Error(`Unexpected first symbol character: ${peek()}`);
                }
                tokens.push({ type: token_types_1.TokenType.PLUS, value: '+' });
                break;
            case '/':
                if (peek() !== ' ') {
                    throw new Error(`Unexpected first symbol character: ${peek()}`);
                }
                tokens.push({ type: token_types_1.TokenType.SLASH, value: '/' });
                break;
            case '*':
                if (peek() !== ' ') {
                    throw new Error(`Unexpected first symbol character: ${peek()}`);
                }
                tokens.push({ type: token_types_1.TokenType.STAR, value: '*' });
                break;
            case '%':
                if (peek() !== ' ') {
                    throw new Error(`Unexpected first symbol character: ${peek()}`);
                }
                tokens.push({ type: token_types_1.TokenType.MODULO, value: '%' });
                break;
            case '!':
                if (peek() === '=') {
                    consume();
                    tokens.push({ type: token_types_1.TokenType.BANG_EQUAL, value: '!==' });
                    break;
                }
                if (peek() !== ' ') {
                    throw new Error(`Unexpected first symbol character: ${peek()}`);
                }
                tokens.push({ type: token_types_1.TokenType.BANG, value: '!' });
                break;
            case '>':
                if (peek() === '=') {
                    consume();
                    tokens.push({ type: token_types_1.TokenType.GREATER_EQUAL, value: '>=' });
                    break;
                }
                if (peek() !== ' ') {
                    throw new Error(`Unexpected first symbol character: ${peek()}`);
                }
                tokens.push({ type: token_types_1.TokenType.GREATER, value: '>' });
                break;
            case '<':
                if (peek() === '=') {
                    consume();
                    tokens.push({ type: token_types_1.TokenType.LESS_EQUAL, value: '<=' });
                    break;
                }
                if (peek() !== ' ') {
                    throw new Error(`Unexpected first symbol character: ${peek()}`);
                }
                tokens.push({ type: token_types_1.TokenType.LESS, value: '<' });
                break;
            case '=':
                if (peek() !== ' ') {
                    throw new Error(`Unexpected first symbol character: ${peek()}`);
                }
                tokens.push({ type: token_types_1.TokenType.EQUAL, value: '===' });
                break;
            case '"':
                {
                    let str = '';
                    while (current < input.length && peek() !== '"') {
                        str += consume();
                    }
                    if (peek() !== '"') {
                        throw new Error('Unexpected character');
                    }
                    // consume closing quotes
                    consume();
                    tokens.push({ type: token_types_1.TokenType.STRING, value: `"${str}"` });
                }
                break;
            case ':':
                {
                    let key = char;
                    while (/^[A-Za-z0-9_!@-]*$/.test(peek())) {
                        key += consume();
                    }
                    tokens.push({ type: token_types_1.TokenType.IDENTIFIER, value: key });
                }
                break;
            case '\n':
                tokens.push({ type: token_types_1.TokenType.NEWLINE, value: '\n' });
                break;
            case ' ':
                break;
            default:
                {
                    if (!isNaN(Number(char))) {
                        let numbers = char;
                        while (!isNaN(parseInt(peek()))) {
                            numbers += consume();
                        }
                        tokens.push({ type: token_types_1.TokenType.NUMBER, value: Number(numbers) });
                    }
                    else if (/^[A-Za-z0-9_@-]*$/.test(char)) {
                        let identifier = char;
                        while (/^[A-Za-z0-9_!@-]*$/.test(peek())) {
                            identifier += consume();
                        }
                        tokens.push({ type: token_types_1.TokenType.IDENTIFIER, value: identifier });
                    }
                    else {
                        throw new Error(`Unexpected character: ${char}`);
                    }
                }
                break;
        }
    }
    return tokens;
};
exports.tokenize = tokenize;

},{"./types/token.types":7}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const traverser_1 = require("./traverser");
const transform = (ast) => {
    const newAst = JSON.parse(JSON.stringify(ast));
    const wrapWithExpressionStatement = (node, parent) => {
        const newNode = {
            generaltype: 'Statement',
            type: 'ExpressionStatement',
            expression: node,
        };
        for (let i = 0; i < parent.body.length; i++) {
            if (parent.body[i] === node) {
                ;
                parent.body[i] = newNode;
            }
        }
    };
    const transformerVisitor = {
        BinaryExpression: {
            enter: (node, parent) => {
                if (parent.type === 'Program' || parent.type === 'BlockStatement') {
                    wrapWithExpressionStatement(node, parent);
                }
            },
        },
        UnaryExpression: {
            enter: (node, parent) => {
                if (parent.type === 'Program' || parent.type === 'BlockStatement') {
                    wrapWithExpressionStatement(node, parent);
                }
            },
        },
        AssignmentExpression: {
            enter: (node, parent) => {
                if (parent.type === 'Program' || parent.type === 'BlockStatement') {
                    wrapWithExpressionStatement(node, parent);
                }
            },
        },
        CallExpression: {
            enter: (node, parent) => {
                if (parent.type === 'Program' || parent.type === 'BlockStatement') {
                    wrapWithExpressionStatement(node, parent);
                }
            },
        },
        ArrayExpression: {
            enter: (node, parent) => {
                if (parent.type === 'Program' || parent.type === 'BlockStatement') {
                    wrapWithExpressionStatement(node, parent);
                }
            },
        },
    };
    traverser_1.traverse(newAst, transformerVisitor);
    return newAst;
};
exports.transform = transform;

},{"./traverser":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traverse = void 0;
const traverse = (ast, visitor) => {
    const traverseArray = (array, parent) => {
        for (let i = 0; i < array.length; i++) {
            traverseNode(array[i], parent);
        }
    };
    const traverseNode = (node, parent) => {
        const methods = visitor[node.type];
        if (methods && methods.enter) {
            methods.enter(node, parent);
        }
        switch (node.type) {
            case 'Program':
                traverseArray(node.body, node);
                break;
            case 'BlockStatement':
                traverseArray(node.body, node);
                break;
            case 'IfStatement':
                {
                    traverseNode(node.consequent, node);
                    if (node.alternate !== null) {
                        traverseNode(node.alternate, node);
                    }
                }
                break;
            case 'VariableDeclaration':
                traverseArray(node.declarations, node);
                break;
            case 'VariableDeclarator':
                traverseNode(node.init, node);
                break;
            case 'ExpressionStatement':
                traverseNode(node.expression, node);
                break;
            case 'CallExpression':
                traverseNode(node.callee, node);
                traverseArray(node.arguments, node);
                break;
            case 'ArrayExpression':
                traverseArray(node.elements, node);
                break;
            case 'MemberExpression':
                traverseNode(node.object, node);
                traverseNode(node.property, node);
                break;
            case 'ObjectExpression':
                traverseArray(node.properties, node);
                break;
            case 'Property':
                traverseNode(node.key, node);
                traverseNode(node.value, node);
                break;
            case 'AssignmentExpression':
                traverseNode(node.left, node);
                traverseNode(node.right, node);
                break;
            case 'ArrowFunctionExpression':
                traverseArray(node.params, node);
                traverseNode(node.body, node);
                break;
            case 'BinaryExpression':
                traverseNode(node.left, node);
                traverseNode(node.right, node);
                break;
            case 'UnaryExpression':
                traverseNode(node.argument, node);
                break;
            case 'SpreadElement':
                traverseNode(node.argument, node);
                break;
            case 'Identifier':
            case 'Literal':
                break;
            default:
                throw new Error(`Undefined AST node type: ${node.type}`);
        }
        if (methods && methods.exit) {
            methods.exit(node, parent);
        }
    };
    traverseNode(ast, ast);
};
exports.traverse = traverse;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType["OPEN_PAREN"] = "OPEN_PAREN";
    TokenType["CLOSE_PAREN"] = "CLOSE_PAREN";
    TokenType["MINUS"] = "MINUS";
    TokenType["PLUS"] = "PLUS";
    TokenType["SLASH"] = "SLASH";
    TokenType["STAR"] = "STAR";
    TokenType["EQUAL"] = "EQUAL";
    TokenType["MODULO"] = "MODULO";
    TokenType["BANG"] = "BANG";
    TokenType["BANG_EQUAL"] = "BANG_EQUAL";
    TokenType["GREATER"] = "GREATER";
    TokenType["GREATER_EQUAL"] = "GREATER_EQUAL";
    TokenType["LESS"] = "LESS";
    TokenType["LESS_EQUAL"] = "LESS_EQUAL";
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["STRING"] = "STRING";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["IF"] = "IF";
    TokenType["ELSE"] = "ELSE";
    TokenType["NIL"] = "NIL";
    TokenType["FUN"] = "FUN";
    TokenType["NEWLINE"] = "NEWLINE";
})(TokenType = exports.TokenType || (exports.TokenType = {}));

},{}]},{},[2])(2)
});
