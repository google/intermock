# Copyright 2019 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


#!/bin/bash
git diff HEAD~1 --cached --name-only --diff-filter=ACMRT |
  grep '.ts$' |
  xargs -n1 ./node_modules/.bin/clang-format -style=file -output-replacements-xml |
  grep "<replacement " >/dev/null
if [ $? -ne 1 ]; then
    echo "Commit did not match clang-format. Run clang-format over last commit's TS files"
    exit 1
fi
