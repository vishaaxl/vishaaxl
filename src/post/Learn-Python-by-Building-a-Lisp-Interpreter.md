---
title: "Learn Python by Building a Lisp Interpreter"
subtitle: Master Lisp Concepts and Python Implementation by Creating Your Own Interpreter
author: Vishal Shukla
date: January 22, 2022
---

## Introduction to Lisp

Lisp, an acronym for _list processing_, is a functional programming language that was designed for easy manipulation of data strings. Lisp is renowned for its simplicity and elegance in symbolic computation. Lisp programs are composed of expressions (lists), making it uniquely suited for recursive operations and manipulation of symbolic data.

In this blog, we’ll build a minimalist Lisp interpreter in Python. By the end of this guide, you’ll have a working interpreter capable of evaluating basic Lisp expressions, defining functions, and performing conditional logic.

### Example of Lisp Syntax

Below is a simple Lisp program to calculate the cube of a number:

```
(define square (lambda (x) (* x x)))
(square 4)
Output: 16
```

In this example:

- `define` is used to create new variables or functions in Lisp. It associates a name with a value or a function, allowing you to reference it later in your code.

- `lambda` is used to create anonymous functions in Lisp. These are functions without a predefined name. Instead of defining them upfront, you can create them dynamically and assign them to variables (or pass them around).

If you'd like to dive deeper into Lisp programming, a great starting point is [this turotial](https://learnxinyminutes.com/common-lisp/).

### Steps to Implement a Lisp Interpreter

Create a new file named `lis.py`. This will be the main Python script for the interpreter.

### 1. **Tokenization**:

In this step, the input string is split into smaller, meaningful pieces called tokens. For example, an expression like `(+ 1 2)` is broken into the list `["(", "+", "1", "2", ")"]`. This process makes analyzing and manipulating the input easier for further processing.

```python
def tokenize(source):
    """
    Tokenizes the input source string by:
    - Replacing opening and closing parentheses with space-padded versions to treat them as separate tokens.
    - Splitting the modified string by spaces to get a list of tokens.

    Args:
    - source (str): The source code to tokenize.

    Returns:
    - List of strings: A list of tokens that represent the source code.
    """
    return source.replace("(", " ( ").replace(")"," ) ").split()
```

### 2. **Parsing**:

After tokenization, the tokens are converted into a structured format, typically a nested list. For instance, `["(", "+", "1", "2", ")"]` becomes `["+", 1, 2]`. This structured representation allows for easier evaluation of the expression by mapping it to a tree-like structure known as an Abstract Syntax Tree (AST).

```python
def read_from_tokens(tokens):
    """
    Reads from the list of tokens and recursively builds the corresponding Abstract Syntax Tree (AST).
    Handles parentheses to construct nested lists, and converts tokens to the corresponding atomic values (e.g., numbers or symbols).

    Args:
    - tokens (list): A list of tokens to process.

    Returns:
    - The corresponding expression represented by the tokens.

    Raises:
    - EOFError: If the token list is empty unexpectedly.
    - SyntaxError: If there is an unexpected closing parenthesis.
    """
    if not tokens:
        raise EOFError("Unexpected EOF while reading")

    token = tokens.pop(0)
    if token == '(':
        res = []
        while tokens[0] != ')':
            res.append(read_from_tokens(tokens))
        tokens.pop(0)
        return res
    elif token == ')':
        return SyntaxError("Unexpected ')'")  # Error if closing parenthesis appears too early.
    else:
        return atom(token)

def atom(token):
    """
    Attempts to convert a token to an integer, float, or leave it as a symbol if it's neither.

    Args:
    - token (str): The token to convert.

    Returns:
    - The converted token, which could be an integer, float, or the original string.
    """
    try:
        return int(token)
    except ValueError:
        try:
            return float(token)
        except ValueError:
            return token

 def parse(source):
    """
    Parses the source code into an Abstract Syntax Tree (AST).

    Args:
    - source (str): The source code to parse.

    Returns:
    - The Abstract Syntax Tree (AST) representing the source code.
    """
    return read_from_tokens(tokenize(source))
```

### 3. **Environment Setup**:

The environment acts as a dictionary where variable names and functions are stored. It includes built-in functions like `+`, `-`, `*`, `/`, and others, as well as user-defined variables and functions. This environment allows the interpreter to resolve symbols (like `x` or `+`) when used in expressions.

```python
class Env(dict):
    """
    Represents an environment that holds variables and their values.
    It also links to an outer environment for variable resolution in nested scopes.

    Attributes:
    - params (tuple): The list of parameter names.
    - args (tuple): The values of the parameters.
    - outer (Env): The outer environment, for scoping purposes.
    """
    def __init__(self, params=(), args=(), outer=None):
        self.update(zip(params, args))
        self.outer = outer

    def find(self, var):
        """
        Finds the environment in which a variable is defined.

        Args:
        - var (str): The variable name to search for.

        Returns:
        - The environment that contains the variable.
        """
        return self if (var in self) else self.outer.find(var)

def standard_env():
    """
    Creates a standard environment for evaluating Scheme-like expressions.
    The environment contains built-in mathematical functions and operators, such as +, -, *, etc.

    Returns:
    - An Env object containing the standard functions and operators.
    """
    env = Env()
    env.update(vars(math))  # Import standard math functions like sin, cos, sqrt, etc.
    env.update({
        '+': op.add, '-': op.sub, '*': op.mul, '/': op.truediv,
        '>': op.gt, '<': op.lt, '>=': op.ge, '<=': op.le, '=': op.eq,
        'abs': abs,
        'append': op.add,
        'begin': lambda *x: x[-1],
        'car': lambda x: x[0],
        'cdr': lambda x: x[1:],
        'cons': lambda x, y: [x] + y,
        'eq?': op.is_,
        'equal?': op.eq,
        'length': len,
        'list': lambda *x: list(x),
        'list?': lambda x: isinstance(x, list),
        'map': map,
        'max': max,
        'min': min,
        'not': op.not_,
        'null?': lambda x: x == [],
        'number?': lambda x: isinstance(x, (int, float)),
        'procedure?': callable,
        'round': round,
        'symbol?': lambda x: isinstance(x, str),
    })
    return env

global_env = standard_env()
```

### Why Do We Need the `Env` Class?

The `Env` class is crucial because it acts as the backbone of the interpreter, managing variables, functions, and scope. Here’s why it’s needed:

- **Variable Binding**  
  In Lisp, variables can be defined and used later in expressions. The `Env` class serves as a dictionary that stores variable names as keys and their corresponding values as entries.

      Example:

      ```
      (define x 10)
      (+ x 5)  ; Result: 15
      ```

      The `define` operation associates `x` with `10`. When `x` is referenced later, the `Env` class retrieves its value.

- **Function Storage**  
   Lisp allows defining custom functions. These functions are stored in the environment and can be called later. The `Env` class keeps track of these functions and their corresponding implementations.
  Example:
  ```
    (define square (lambda (x) (* x x)))
    (square 4)  ; Result: 16
  ```


- **Scoped Resolution**
    Lisp supports nested scopes. For example, variables defined within a function should not overwrite global variables. The `Env` class supports this by linking to an outer environment, allowing scoped variable resolution.

    Example:

    ```
    (define x 10)
    (define square (lambda (x) (* x x)))
    (square 4)  ; Result: 16
    x           ; Result: 10
    ```

-   **Built-in Functions**
    The `Env` class includes a standard environment containing built-in operations (e.g., `+`, `-`, `*`, `/`, `sin`, `cos`) so that basic computations can be performed immediately.


### 4.  **Evaluation**:
  The core logic of the interpreter, where parsed expressions are computed:

  -   Numbers (e.g., `1`, `2.5`) and variables (e.g., `x`, `y`) evaluate to their respective values.
  -   Function calls (e.g., `(+ 1 2)`) are recursively evaluated. The operator (`+`) and arguments (`1`, `2`) are resolved and computed using the environment.

   ```python
 class Procedure(object):
    """
    Represents a user-defined function in the Lisp environment.

    Attributes:
    - params (tuple): The parameters of the function.
    - body (list): The body of the function (a list of expressions to evaluate).
    - env (Env): The environment in which the function was created.
    """
    def __init__(self, params, body, env):
        self.params, self.body, self.env = params, body, env

    def __call__(self, *args):
        """
        Calls the function with provided arguments, creating a new environment for the call.

        Args:
        - args (tuple): The arguments to pass to the function.

        Returns:
        - The result of evaluating the function's body in the new environment.
        """
        local_env = Env(self.params, args, self.env)
        return eval(self.body, local_env)

def eval(ast, env=global_env):
    """
    Evaluates an Abstract Syntax Tree (AST) in the given environment.

    Args:
    - ast: The AST to evaluate.
    - env (Env): The environment in which to evaluate the AST.

    Returns:
    - The result of evaluating the AST.
    """
    match ast:
        case str() as symbol:
            return env.find(symbol)[symbol]

        case int() | float() as value:
            return value

        case ["quote", value]:
            return value

        case ["define", variable, value]:
            evaluated_value = eval(value, env)
            env[variable] = evaluated_value
            return evaluated_value

        case ["if", condition, operation, alternative]:
            conditional_value = eval(condition, env)
            if conditional_value:
                return eval(operation, env)
            else:
                return eval(alternative, env)

        case ["lambda", params, body]:
            return Procedure(params, body, env)

        case [operator, *args]:
            operator_value = eval(operator, env)
            operands = [eval(operand, env) for operand in args]
            return operator_value(*operands)
````

### 5. **REPL (Read-Eval-Print Loop)**:

The REPL is an interactive shell that allows users to input and execute Lisp commands in real-time. It reads user input (e.g., `(define x 10)`), evaluates it (e.g., assigns `10` to `x`), and prints the result.

```python
def repl(prompt="lis.py> "):
    """
    The Read-Eval-Print Loop (REPL) for evaluating Lisp expressions.

    Args:
    - prompt (str): The prompt to display to the user.
    """
    while True:
        try:
            source = input(prompt)
            if source.strip().lower() == "exit":
                print("Exiting")
                break
            print(eval(parse(source)))
        except Exception as e:
            print(f"Error: {e}")
```

## Conclusion

By following the steps above, you've created a basic Lisp interpreter that can handle arithmetic expressions, define functions, and even handle conditional logic. This is just a simple version, but as you explore further, you can expand it with more features like advanced error handling, better scoping, and additional built-in functions.

If you're interested in diving deeper into the world of Lisp and learning more advanced concepts, I highly recommend checking out [Peter Norvig’s Lisp Interpreter Tutorial](https://norvig.com/lispy.html), which was an excellent resource for building the interpreter in this guide.
