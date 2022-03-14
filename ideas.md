# Autoraider Challenge Ideas

These are ideas for a CTF challenge called "Autoraider", a parody on the EECS department's [autograder.io](autograder.io) that automatically grades our C++ code in courses like EECS 280.

## General Architecture

- Can build app from a single Dockerfile
- Simple web server for users to submit code
- Session by cookie
  - Each session creates a folder
  - Generates random correct output
- The UI allows unlimited submissions
- Submission runs code in backend
  - Run bash script
    - `make` runs `g++` with `oracle_tests.cpp`
    - `oracle_tests.cpp` has one function with `assert` statements
    - Runs `oracle_tests.exe` in `nsjail` or `firejail` to avoid accessing internet or other files, piping in correct
    - Check if `$?` is `0` for pass
    - Store if latest test passed in file or local database
  - After script finish, website will show when private tests complete
- "Time travel to deadline button" will grade and reveal private test case results for **latest submission** (not best, to avoid brute force).
  - Retrieves result from file or database
    - If pass, send back flag
    - If fail, block submissions
- "Jump universes button" will reset submissions and regenerate the correct output

## Exploit Ideas

### 1. Delay Oracle

#### Project Spec
- 9 questions
- 8 have two possible answers, last has only one possible answer
  - Maybe the last question is something like "Go" and the answer is "Blue" to be cheeky
  - This means that there are `2^8=256` possible combinations, making guessing very unlikely

#### Exploit Premise

`assert` statements execute one after another on each question passed into `oracle`, and execution stops when an `assert` fails. When the execution stops (regardless of pass or fail), the server returns a response to the website. The user has unlimited submissions, but only the **latest** will be graded.

#### Exploit Strategy

The attacker could figure out if each of the **assert** statements for `oracle(n)` passes or fails by having `oracle(n+1)` take a long time to execute. If the server takes a while to send a response back, then they know that `oracle(n)` passed. If the server sends a response back quickly, they know that `oracle(n)` failed since the program quit before the slow `oracle(n)` got a chance to even run.