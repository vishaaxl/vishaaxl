---
title: "Building a String Calculator with Test-Driven Development (TDD): A Step-by-Step Guide"
subtitle: "Learn to implement a string calculator using Test-Driven Development in Python, with practical examples and best practices."
author: Vishal Shukla
date: January 15, 2025
---

We will implement a string calculator in `Python` using a test-driven development (TDD) approach. This means we will write tests for each feature before implementing the corresponding functionality.

You can refer to the link [https://osherove.com/tdd-kata-1](https://osherove.com/tdd-kata-1) as your checkpoints for implementing TDD. The link provides step-by-step instructions that you can follow.

## Getting started

In your project folder, create two files: `string_calculator.py` and `tests/test_string_calculator.py`. We'll implement the features step by step. First, we need to create a `StringCalculator` class with an `add` method.

## Step 1: Empty String Should Return "0"

Let's write the first test for our application using the `unittest` library. Open the `tests/test_string_calculator.py` file and start with the following code:

```python
import unittest
from string_calculator import StringCalculator

class TestStringCalculator(unittest.TestCase):
    """Test suite for the StringCalculator class."""

    def setUp(self):
        """
        Create a new instance of StringCalculator for each test.
        Can use static method to avoid creating a new instance.
        """
        self.calculator = StringCalculator()

    def test_empty_string_returns_zero(self):
        """
        Test case: Adding an empty string should return 0.
        Input: ""
        Expected Output: 0
        """
        self.assertEqual(self.calculator.add(""), 0)
```

Now, let's implement the `StringCalculator` class in the `string_calculator.py` file:

```python
class StringCalculator:
    def add(self, numbers:str):
        if not numbers:
            return 0

```

To run the tests, follow these steps:

1.  Ensure that you are in the project directory where your `string_calculator.py` and `tests/test_string_calculator.py` files are located.
2.  Open your terminal or command prompt.
3.  Run the following command to execute the tests:

```
python -m unittest discover tests
```

This command will automatically discover and run all tests within the `tests` folder.

### Expected Output:

You should see something like this if the test passes:

```


----------------------------------------------------------------------
Ran 1 test in 0.001s

OK
```

If everything is set up correctly and the test case passes, it means your implementation for handling an empty string is working as expected.

## Step 2: Adding One or Two Numbers Should Return Their Sum

We need to update the method to handle the case where there is only one number or two numbers in the input string, and it should return their sum. For an empty string, the method should return 0.

### Writing the Test

Open the `tests/test_string_calculator.py` file and add the following test cases to cover all the scenarios:

```python
    def test_add_single_number(self):
        """
        Test case: Adding a single number should return the number itself.
        Input: "1"
        Expected Output: 1
        """
        self.assertEqual(self.calculator.add("1"), 1)

    def test_add_two_numbers(self):
        """
        Test case: Adding two numbers should return their sum.
        Input: "1,2"
        Expected Output: 3
        """
        self.assertEqual(self.calculator.add("1,2"),3)
```

### Implementing the Code

Now, update the `add` method in the `string_calculator.py` file to handle the addition of one or two numbers:

```python
class StringCalculator:
    def add(self, numbers:str):
        if not numbers:
            return 0
        '''
        Split the string by commas, convert each value to an integer,
        and sum them up
        '''
        numbers_list = map(int,numbers.split(','))
        return sum(numbers_list)
```

You can test the code again by following the previous steps.

## Step 3 : Handling Multiple Numbers

We'll write a test case to check if the method can handle multiple numbers separated by commas.

### Writing the Test

Open the `tests/test_string_calculator.py` file and add a test case to handle multiple numbers:

```python
def test_add_multiple_numbers(self):
    """
    Test case: Adding multiple numbers should return their sum.
    Input: "1,2,3,4,5"
    Expected Output: 15
    """
    self.assertEqual(self.calculator.add("1,2,3,4,5"), 15)
```

The functionality has already been implemented, so we can proceed to test the code and then move on to the next step.

## Step 4: Handling New Lines Between Numbers

Now, we need to enhance the `add` method to handle new lines (`\n`) as valid separators between numbers, in addition to commas.

### Writing the Test

Open the `tests/test_string_calculator.py` file and add a test case to check if the method correctly handles new lines as separators:

```python
def test_add_numbers_with_newlines(self):
    """
    Test case: Adding numbers separated by newlines should return their sum.
    Input: "1\n2\n3"
    Expected Output: 6
    """
    self.assertEqual(self.calculator.add("1\n2\n3"), 6)
```

### Implementing the Code

Next, update the `add` method in the `string_calculator.py` file to handle new lines (`\n`) as separators. We can modify the method to replace `\n` with commas, then split the string by commas.

Here's the updated code for the `add` method:

```python
class StringCalculator:
    def add(self, numbers:str):
        if not numbers:
            return 0

        numbers = numbers.replace("\n", ",")

        '''
        Split the string by commas, convert each value to an integer,
        and sum them up
        '''
        numbers_list = map(int,numbers.split(','))
        return sum(numbers_list)
```

You can test the code again by following the previous steps defined in **step1**.

## Step 5: Handling Custom Delimiters

In this step, we will enhance the functionality further to allow custom delimiters. For instance, users should be able to specify a custom delimiter at the beginning of the string. For example:

- The input string could start with `//` followed by a custom delimiter, e.g., `//;\n1;2;3` should return `6`.
- We will support delimiters like `//;\n1;2;3`.

### Writing the Test

Open the `tests/test_string_calculator.py` file and add a test case to handle the custom delimiter functionality:

```python
def test_add_numbers_with_custom_delimiter(self):
    """
    Test case: Adding numbers separated by a custom delimiter should return their sum.
    Input: "//;\n1;2;3"
    Expected Output: 6
    """
    self.assertEqual(self.calculator.add("//;\n1;2;3"), 6)
```

### Implementing the Code

To handle custom delimiters, update the `add` method to look for the delimiter in the input string. The delimiter should be specified at the beginning of the string after `//`.

Here’s the updated `add` method:

```python
class StringCalculator:
    def add(self, numbers:str):
        if not numbers:
            return 0

        if numbers.startswith("//"):
            delimiter_end_index = numbers.index("\n")
            delimiter = numbers[2:delimiter_end_index]
            numbers = numbers[delimiter_end_index + 1:]
            numbers = numbers.replace(delimiter,",")

        numbers = numbers.replace("\n", ",")

        '''
        Split the string by commas, convert each value to an integer,
        and sum them up
        '''
        numbers_list = map(int,numbers.split(','))
        return sum(numbers_list)
```

## Step 6: Handling Negative Numbers

In this step, we need to modify the `add` method to handle negative numbers. When a negative number is passed, it should throw an exception with the message "negatives not allowed", and include the negative numbers that were passed.

### Writing the Test

Open the `tests/test_string_calculator.py` file and add a test case to handle the negative number exception:

```python
def test_add_negative_numbers(self):
    """
    Test case: Adding numbers with negative numbers should raise an exception.
    Input: "-1,2,3"
    Expected Output: "Negative numbers are not allowed: -1"
    """
    with self.assertRaises(ValueError) as e:
        self.calculator.add("-1,2,-3")
    self.assertEqual(str(e.exception), "Negative numbers are not allowed: -1, -3")
```

### Implementing the Code

Now, modify the `add` method to check for negative numbers and raise a `ValueError` with the appropriate message.

Here's the updated `add` method:

```python
class StringCalculator:
    def add(self, numbers:str):
        if not numbers:
            return 0

        if numbers.startswith("//"):
            delimiter_end_index = numbers.index("\n")
            delimiter = numbers[2:delimiter_end_index]
            numbers = numbers[delimiter_end_index + 1:]
            numbers = numbers.replace(delimiter,",")

        numbers = numbers.replace("\n", ",")



        numbers_list = numbers.split(",")
        negatives = []

        for num in numbers_list:
            number = int(num)
            if number < 0:
                negatives.append(number)

        if negatives:
            raise ValueError(f"negative numbers are not allowed: {', '.join(map(str, negatives))}")

        return sum(map(int,numbers_list))
```

## Step 7: Counting Add Method Calls

In this step, we will add a method called `GetCalledCount()` to the `StringCalculator` class that will return how many times the `add()` method has been invoked. We will follow the TDD process by writing a failing test first, and then implementing the feature.

### Writing the Test

Start by adding a test case for the `GetCalledCount()` method. This test should check that the method correctly counts the number of times `add()` is called.

Open the `tests/test_string_calculator.py` file and add the following test:

```python
def test_get_called_counts(self):
    """
    Test case: Calling get_called_counts method should return the number of times add method was called.
    Input: Multiple add calls
    Expected Output: 2 (if add() was called 2 times)
    """
    self.calculator.add("1,2,3")
    self.calculator.add("1,2")
    self.assertEqual(self.calculator.get_called_count(), 2)
```

### Implementing the Code

Now, implement the `GetCalledCount()` method in the `StringCalculator` class. This method will need to keep track of how many times `add()` has been invoked.

Here’s the updated `StringCalculator` class:

```python
class StringCalculator:
    def __init__(self):
        self.called_count = 0
    def add(self, numbers:str):
        if not numbers:
            return 0

        if numbers.startswith("//"):
            delimiter_end_index = numbers.index("\n")
            delimiter = numbers[2:delimiter_end_index]
            numbers = numbers[delimiter_end_index + 1:]
            numbers = numbers.replace(delimiter,",")

        numbers = numbers.replace("\n", ",")



        numbers_list = numbers.split(",")
        negatives = []

        for num in numbers_list:
            number = int(num)
            if number < 0:
                negatives.append(number)

        if negatives:
            raise ValueError(f"negative numbers are not allowed: {', '.join(map(str, negatives))}")

        self.called_count += 1
        return sum(map(int,numbers_list))

    def get_called_count(self):
        return self.called_count
```

## Step 8 & 9: Ignore Numbers Greater Than 1000 and Handle Custom Delimiters of Any Length

In this step, we will implement two requirements:

1.  Numbers greater than 1000 should be ignored in the sum.
2.  Custom delimiters can be of any length, with the format `//[delimiter]\n`, and the method should handle them.

We will first write the tests for both of these requirements, then implement the functionality in the `StringCalculator` class.

### Writing the Tests

Add the following tests for both the ignore numbers greater than 1000 and handling custom delimiters of any length. Open the `tests/test_string_calculator.py` file and add the following:

```python
def test_add_numbers_greater_than_1000(self):
    """
    Test case: Numbers greater than 1000 should be ignored when calculating the sum.
    Input: "1,1001,2,3"
    Expected Output: 6
    """
    self.assertEqual(self.calculator.add("1,1001,2,3"), 6)

def test_add_numbers_with_custom_delimiter_long_length(self):
    """
    Test case: Adding numbers separated by a custom delimiter with a long length should return their sum.
    Input: "//[***]\n1***2***3"
    Expected Output: 6
    """
    self.assertEqual(self.calculator.add("//[***]\n1***2***3"), 6)
```

### Implementing the Code

Now, implement the functionality in the `StringCalculator` class. This will include:

1.  Ignoring numbers greater than 1000.
2.  Handling custom delimiters of any length.

Here’s the updated `StringCalculator` class:

```python
class StringCalculator:
    def __init__(self):
        self.called_count = 0
    def add(self, numbers:str):
        if not numbers:
            return 0

        if numbers.startswith("//"):
            delimiter_end_index = numbers.index("\n")
            delimiter = numbers[2:delimiter_end_index]

            if delimiter.startswith("[") and delimiter.endswith("]"):
                delimiter = delimiter[1:-1]

            numbers = numbers[delimiter_end_index + 1:]
            numbers = numbers.replace(delimiter,",")

        numbers = numbers.replace("\n", ",")



        numbers_list = numbers.split(",")
        negatives = []
        numbers_to_add = []

        for num in numbers_list:
            number = int(num)
            if number < 0:
                negatives.append(number)
            elif number > 1000:
                continue
            else:
                numbers_to_add.append(number)


        if negatives:
            raise ValueError(f"negative numbers are not allowed: {', '.join(map(str, negatives))}")

        self.called_count += 1
        return sum(map(int, numbers_to_add))

    def get_called_count(self):
        return self.called_count
```

## Step 10: Multiple Delimiters Support

In this step, we will modify the `add()` method to support multiple delimiters of any length. This will allow us to handle cases where there are multiple delimiters in the format `//[delimiter1][delimiter2]\n`.

### Writing the Test

Start by adding a test case to check for multiple delimiters. Open the `tests/test_string_calculator.py` file and add the following test:

```python
def test_add_numbers_with_multiple_delimiters(self):
    """
    Test case: Multiple delimiters of any length can be used.
    Input: "//[***][%%]\n1***2%%3"
    Expected Output: 6
    """
    self.assertEqual(self.calculator.add("//[***][%%]\n1***2%%3"), 6)
```

### Implementing the Code

Now, modify the `add()` method to handle multiple delimiters. The delimiters will be passed inside `[]`, and we need to support handling multiple delimiters in the format `//[delimiter1][delimiter2]\n`.

Here's the updated `StringCalculator` class to support this:

```python
import re

class StringCalculator:
    """
    A class to implement a string calculator that can add numbers from a given string.
    The calculator supports multiple delimiters, new lines between numbers, and backward compatibility with the older format.

    Attributes:
    called_count (int): The count of how many times the add() method was called.
    """

    def __init__(self):
        """
        Initializes a StringCalculator instance and sets the called count to 0.
        """
        self.called_count = 0

    def add(self, numbers: str):
        """
        Adds numbers from the given string, supporting custom delimiters, multiple delimiters,
        ignoring numbers greater than 1000, and handling negative numbers with an exception.

        The input string can use the following formats:
        1. Comma-separated values (e.g., "1,2,3")
        2. New line-separated values (e.g., "1\n2\n3")
        3. Custom delimiters defined by the user in the format `//[delimiter]\n`.

        Additionally, the method:
        - Ignores numbers greater than 1000.
        - Throws a ValueError if any negative numbers are provided.

        Parameters:
        numbers (str): A string of numbers, optionally separated by commas, new lines, or custom delimiters.

        Returns:
        int: The sum of the numbers in the input string.

        Raises:
        ValueError: If any negative numbers are found, a ValueError is raised with the message
                    "negative numbers are not allowed" followed by the negative numbers.

        Example:
        >>> calculator = StringCalculator()
        >>> calculator.add("1,2,3")
        6

        >>> calculator.add("//[***]\n1***2***3")
        6
        """
        if not numbers:
            return 0

        if numbers.startswith("//"):
            delimiter_end_index = numbers.index("\n")
            delimiter_section = numbers[2:delimiter_end_index]

            if delimiter_section.startswith("["):
                delimiters = re.findall(r'\[([^\]]+)\]', delimiter_section)
            else:
                delimiters = [delimiter_section]

            numbers = numbers[delimiter_end_index + 1:]

            for delimiter in delimiters:
                numbers = numbers.replace(delimiter, ",")

        numbers = numbers.replace("\n", ",")

        numbers_list = numbers.split(",")
        negatives = []
        numbers_to_add = []

        for num in numbers_list:
            number = int(num)
            if number < 0:
                negatives.append(number)
            elif number > 1000:
                continue
            else:
                numbers_to_add.append(number)

        if negatives:
            raise ValueError(f"negative numbers are not allowed: {', '.join(map(str, negatives))}")

        self.called_count += 1
        return sum(map(int, numbers_to_add))

    def get_called_count(self):
        """
        Returns the number of times the add() method has been invoked.

        Returns:
        int: The count of times add() has been called.

        Example:
        >>> calculator = StringCalculator()
        >>> calculator.add("1,2")
        >>> calculator.get_called_count()
        1
        """
        return self.called_count

```

### Testing It

Run the tests again to verify that everything works, including backward compatibility with the old format and support for the new multiple delimiters format:

```sh
python -m unittest discover tests
```

### Expected Output

The tests should pass for both old and new formats:

```

..........
----------------------------------------------------------------------
Ran 10 tests in 0.003s

OK

```

Appreciate you following along with this TDD series! I hope you found it useful.
