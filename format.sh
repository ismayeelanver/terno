#!/bin/bash

find . \( -name '*.h' -o -name '*.c' -o -name '*.cpp' \) -exec clang-format -i {} \;