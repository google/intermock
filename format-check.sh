#!/bin/bash
git diff HEAD~1 --cached --name-only --diff-filter=ACMRT |
  grep '.ts$' |
  xargs -n1 clang-format -style=file -output-replacements-xml |
  grep "<replacement " >/dev/null
if [ $? -ne 1 ]; then 
    echo "Commit did not match clang-format. Run clang-format over last commit's TS files"
    exit 1
fi