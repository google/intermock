#!/bin/bash

blah() {
   clang-format -style=file -output-replacements-xml ./src/**/*.ts | grep "</replacement>"
}

OUTPUT=$(blah)
echo $OUTPUT
