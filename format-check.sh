#!/bin/bashs
git diff HEAD~1 --cached --name-only --diff-filter=ACMRT |
  xargs -n1 clang-format -style=file -output-replacements-xml |
  grep "<replacement " >/dev/null
if [ $? -ne 1 ]; then 
    echo "Commit did not match clang-format"
    exit 1
fi