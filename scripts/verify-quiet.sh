#!/bin/bash
output=$(npm run verify 2>&1)
exit_code=$?
if [ $exit_code -eq 0 ]; then
  tests_line=$(echo "$output" | grep -E "Tests\s+" | tail -1)
  echo "✓ verify passed (lint + build + test:coverage)"
  [ -n "$tests_line" ] && echo "$tests_line"
else
  echo "$output"
fi
exit $exit_code
