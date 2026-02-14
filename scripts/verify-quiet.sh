#!/bin/bash
output=$(npm run verify 2>&1)
exit_code=$?

if [ $exit_code -eq 0 ]; then
  tests_line=$(echo "$output" | grep -E "Tests\s+" | tail -1)
  echo "✓ verify passed (lint + build + test:coverage)"
  [ -n "$tests_line" ] && echo "$tests_line"
else
  echo "❌ verify failed"
  echo ""

  # Parse lint errors
  lint_errors=$(echo "$output" | grep -E "^\s*[0-9]+:[0-9]+" | head -10)
  if [ -n "$lint_errors" ]; then
    error_count=$(echo "$lint_errors" | wc -l | tr -d ' ')
    echo "Lint: $error_count error(s)"
    echo "$lint_errors" | sed 's/^/  /'
    echo ""
  fi

  # Parse build errors
  if echo "$output" | grep -q "Failed to compile"; then
    echo "Build: failed"
    # Extract TypeScript errors (simplified)
    build_errors=$(echo "$output" | grep -E "(error TS[0-9]+|Type error:)" | head -5)
    if [ -n "$build_errors" ]; then
      echo "$build_errors" | sed 's/^/  /'
    fi
    echo ""
  elif echo "$output" | grep -q "build.*✓"; then
    echo "Build: passed"
    echo ""
  fi

  # Parse test failures
  if echo "$output" | grep -q "FAIL"; then
    failed_tests=$(echo "$output" | grep -E "✖|FAIL" | grep -v "Tasks:" | head -10)
    if [ -n "$failed_tests" ]; then
      fail_count=$(echo "$failed_tests" | wc -l | tr -d ' ')
      echo "Tests: $fail_count failure(s)"
      echo "$failed_tests" | sed 's/^/  /'
      echo ""
    fi
  elif echo "$output" | grep -q "test:coverage.*✓"; then
    echo "Tests: passed"
    echo ""
  fi

  # Parse coverage failures
  coverage_line=$(echo "$output" | grep -E "ERROR: Coverage" | head -1)
  if [ -n "$coverage_line" ]; then
    echo "$coverage_line"
    # Extract uncovered files
    uncovered=$(echo "$output" | grep -E "^\s+[^%]+\s+\|" | grep -v "100\s*|" | head -5)
    if [ -n "$uncovered" ]; then
      echo "Files below threshold:"
      echo "$uncovered" | sed 's/^/  /'
    fi
  fi
fi

exit $exit_code
