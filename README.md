# m3k

`m3k` is a `lisp` dialect that compiles to `JavaScript`. This repository contains the source code of the compiler and the project still work in progress.



## Try it online

You can try the the language here: https://obsfx.github.io/m3k-playground/



## Examples

Variables and data types

```lisp
(define variable-name value)
(define x 5)
(define pet "Dog")
(define ten 10)
(define negative-ten (- 10))
(define number-list (list 1 2 3 4 5))
(define third-el-list (nth 2 (list 1 2 3 4 5)))
(define dict-example (dict :name "Joe" :surname "Dow"))
(define dict-example-name (getval name dict))
```

Reassign variables

```lisp
(set! r 15)
```



Methods

```lisp
(append list1 list2 list3)
(shift list)
(unshift list 1)
(pop list)
(push list 1)
(includes list "thing")
(concat list1 list2)
(join list1 ", ")
(slice "test-str" 1)
(splice list 5 1)
(map list (defun (element index) (* 2 element)))
(for-each list (defun (element index) (print element index)))
(filter list (defun (element index) (< element index)))
(find list (defun (element index) (< element index)))
(reduce list (defun (prev current) (+ prev current)) 0)
```



Logging

```lisp
(print expression)
(print "m3k")
(print "m3k" "reference")
(print number-list)
```



Function 

```lisp
(define add (defun (a b) (+ a b)))
(define add-and-print 
    (defun (a b) 
        (progn
            (print (+ a b))
            (+ a b))))
```



Logic

```lisp
(!= 5 5)
(= 5 5)
(>= 5 5)
(<= 5 5)
(% 5 5)
```



Conditional

```lisp
(if (= 4 5) (print "equal") (print "not equal"))
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

