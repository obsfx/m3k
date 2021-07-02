# m3k

`m3k` is a `lisp` dialect that compiles to `JavaScript`. This repository contains the source code of the compiler and the project still work in progress.

## Try it online

You can try the the language here: https://obsfx.github.io/m3k-playground/

## Language Overview

```lisp
;; Variables and data types										              compiled output
(define variable-name value)
(define x 5)                                                ;; let x = 5;
(define pet "Dog")                                          ;; let pet = "Dog";
(define negative-ten (- 10))                                ;; let negativeTen = -10;
(define number-list (list 1 2 3 4 5))                       ;; let numberList = [1, 2, 3, 4, 5];
(define third-el-list (nth 2 (list 1 2 3 4 5)))             ;; let thirdElList = [1, 2, 3, 4, 5][2];
(define dict-example (dict :name "Joe" :surname "Dow"))     ;; let dictExample = {name: "Joe", surname: "Dow"};
(define dict-example-name (getval name dict-example))       ;; let dictExampleName = dictExample.name;

;; Function definition
(define add (defun (a b) (+ a b)))                          ;; let add = (a, b) => (a + b);
(define add-and-print (defun (a b)                          ;; let addAndPrint = (a, b) => ((() => {
    (progn                                                  ;;  console.log(a + b);
        (print (+ a b))                                     ;;  return a + b;
        (+ a b))))                                          ;; })());

;; Reassigning variables
(set! variable-name value)
(set! r 15)                                                 ;; r = 15;

;; Pre-defined Methods
(print "hello world")                                       ;; console.log("hello world");
(append arr1 (list 1 2 3 "list-data") arr2)                 ;; [...arr1, ...[1, 2, 3, "list-data"], ...arr2];
(shift arr)                                                 ;; arr.shift();
(unshift arr 1)                                             ;; arr.unshift(1);
(pop arr)                                                   ;; arr.pop();
(push arr 1)                                                ;; arr.push(1);
(includes arr "thing")                                      ;; arr.includes("thing");
(concat arr1 arr2)                                          ;; arr1.concat(arr2);
(join arr ", ")                                             ;; arr.join(", ");
(slice "test-str" 1)                                        ;; "test-str".slice(1);
(splice arr 5 1)                                            ;; arr.splice(5, 1);
(map arr (defun (element index) (* 2 element)))             ;; arr.map((element, index) => (2 * element));
(for-each arr (defun (element index)                        ;; arr.forEach((element, index) => (
                  (print element index)))                   ;; 			console.log(element, index)));
(filter arr (defun (element index) (< element index)))      ;; arr.filter((element, index) => (element < index));
(find arr (defun (element index) (< element index)))        ;; arr.find((element, index) => (element < index));
(reduce arr (defun (prev current) (+ prev current)) 0)      ;; arr.reduce((prev, current) => (prev + current), 0);

;; Accessing JavaScript objects
(getval property object)
(getval body document)                                      ;; document.body
(define canvas ((getval create-element document) "canvas")) ;; let canvas = document.createElement("canvas");

;; Comparison
(!= 5 5)                                                    ;; 5 !== 5;
(= 5 5)                                                     ;; 5 === 5;
(>= 5 5)                                                    ;; 5 >= 5;
(<= 5 5)                                                    ;; 5 <= 5;
(% 5 5)                                                     ;; 5 % 5;

;; Conditional
(if (= 4 5)                                                 ;; (() => {
    (print "equal")                                         ;; if (4 === 5) { return console.log("equal");}
    (print "not equal"))                                    ;; else { return console.log("not equal");}})();
```

## TODO

- [x] primitive types
- [x] variables
- [x] list
- [x] dict
- [x] methods
- [x] accessing objects
- [ ] loops
- [x] functions
- [x] if statements
- [ ] comment lines
- [ ] return expression
- [ ] error for reserved keywords
- [ ] canvas utils
- [ ] built-in draw methods
- [ ] 3D transformations utils
- [ ] keyboards input utils
- [ ] documentation
