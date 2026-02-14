#!/usr/bin/env python3
"""
Analyze a Claude Code session JSONL file for token usage patterns.

Usage: python3 analyze-session.py <session.jsonl>
"""

import json
import sys
from collections import defaultdict


def analyze_session(filepath):
    """Analyze a Claude Code session JSONL file for token usage patterns."""

    # First pass: build tool_use_id -> tool_name mapping
    tool_use_map = {}
    with open(filepath, 'r') as f:
        for line in f:
            try:
                entry = json.loads(line)
                if entry.get('type') in ['assistant', 'user']:
                    message = entry.get('message', {})
                    content = message.get('content', [])
                    if isinstance(content, list):
                        for item in content:
                            if isinstance(item, dict) and item.get('type') == 'tool_use':
                                tool_id = item.get('id')
                                tool_name = item.get('name', 'unknown')
                                if tool_id:
                                    tool_use_map[tool_id] = tool_name
            except (json.JSONDecodeError, KeyError):
                continue

    # Second pass: analyze tool results
    tool_outputs = defaultdict(list)
    large_outputs = []
    message_count = 0
    total_input_tokens = 0
    total_output_tokens = 0
    total_cache_read = 0

    bash_verify_outputs = []
    test_coverage_outputs = []
    read_outputs = []

    with open(filepath, 'r') as f:
        for line_num, line in enumerate(f, 1):
            try:
                entry = json.loads(line)
                if entry.get('type') in ['assistant', 'user']:
                    message = entry.get('message', {})

                    # Track tokens
                    usage = message.get('usage', {})
                    if usage:
                        total_input_tokens += usage.get('input_tokens', 0)
                        total_output_tokens += usage.get('output_tokens', 0)
                        total_cache_read += usage.get('cache_read_input_tokens', 0)

                    content = message.get('content', [])
                    message_count += 1

                    if isinstance(content, list):
                        for item in content:
                            if isinstance(item, dict) and item.get('type') == 'tool_result':
                                tool_use_id = item.get('tool_use_id', '')
                                tool_name = tool_use_map.get(tool_use_id, 'unknown')

                                result_content = item.get('content', '')
                                result_text = ""
                                if isinstance(result_content, str):
                                    result_text = result_content
                                elif isinstance(result_content, list):
                                    for rc in result_content:
                                        if isinstance(rc, dict) and rc.get('type') == 'text':
                                            result_text += rc.get('text', '')

                                result_size = len(result_text)
                                approx_tokens = result_size // 4

                                tool_outputs[tool_name].append({
                                    'size': result_size,
                                    'tokens': approx_tokens,
                                    'line': line_num
                                })

                                if result_size > 5000:
                                    large_outputs.append({
                                        'line': line_num,
                                        'tool': tool_name,
                                        'size': result_size,
                                        'tokens': approx_tokens,
                                        'preview': result_text[:300]
                                    })

                                # Pattern detection
                                if tool_name == 'Bash':
                                    if 'npm run verify' in result_text or 'turbo run verify' in result_text:
                                        is_clean = ('error' not in result_text.lower() and
                                                   'failed' not in result_text.lower() and
                                                   'FAIL' not in result_text)
                                        bash_verify_outputs.append({
                                            'line': line_num,
                                            'size': result_size,
                                            'tokens': approx_tokens,
                                            'clean': is_clean
                                        })

                                    if ('coverage' in result_text.lower() or
                                        'npm test' in result_text or
                                        'npm run test' in result_text):
                                        test_coverage_outputs.append({
                                            'line': line_num,
                                            'size': result_size,
                                            'tokens': approx_tokens
                                        })

                                if tool_name == 'Read':
                                    read_outputs.append({
                                        'line': line_num,
                                        'size': result_size,
                                        'tokens': approx_tokens
                                    })

            except (json.JSONDecodeError, KeyError):
                continue

    # Print summary
    print(f"\n{'='*80}")
    print(f"SESSION ANALYSIS")
    print(f"{'='*80}\n")

    print(f"Messages: {message_count}")
    print(f"Input tokens: {total_input_tokens:,}")
    print(f"Output tokens: {total_output_tokens:,}")
    print(f"Cache read tokens: {total_cache_read:,}")
    print(f"Total: {total_input_tokens + total_output_tokens:,}\n")

    # Tool output statistics
    print("TOOL OUTPUT SIZES:")
    print("-" * 80)
    for tool, outputs in sorted(tool_outputs.items(), key=lambda x: sum(o['tokens'] for o in x[1]), reverse=True):
        total_tokens = sum(o['tokens'] for o in outputs)
        count = len(outputs)
        avg = sum(o['size'] for o in outputs) / count if count else 0
        print(f"{tool:20} | ~{total_tokens:>8,}t | {count:>3}x | Avg: {avg:>8,.0f}c")

    # Pattern analysis
    if bash_verify_outputs:
        print(f"\n{'='*80}")
        print("npm run verify outputs:")
        print("-" * 80)
        clean = [o for o in bash_verify_outputs if o['clean']]
        print(f"Total: {len(bash_verify_outputs)} | Clean: {len(clean)} | With errors: {len(bash_verify_outputs) - len(clean)}")
        print(f"Total tokens: ~{sum(o['tokens'] for o in bash_verify_outputs):,}")

    if test_coverage_outputs:
        print(f"\n{'='*80}")
        print("Test/coverage outputs:")
        print("-" * 80)
        print(f"Total: {len(test_coverage_outputs)}")
        print(f"Total tokens: ~{sum(o['tokens'] for o in test_coverage_outputs):,}")

    if read_outputs:
        print(f"\n{'='*80}")
        print("File reads:")
        print("-" * 80)
        print(f"Total: {len(read_outputs)}")
        print(f"Total tokens: ~{sum(o['tokens'] for o in read_outputs):,}")
        large_reads = [o for o in read_outputs if o['tokens'] > 2000]
        if large_reads:
            print(f"Large reads (>2000t): {len(large_reads)} (~{sum(o['tokens'] for o in large_reads):,}t)")

    # Largest outputs
    print(f"\n{'='*80}")
    print("TOP 10 LARGEST OUTPUTS:")
    print("-" * 80)
    for output in sorted(large_outputs, key=lambda x: x['size'], reverse=True)[:10]:
        print(f"\nLine {output['line']} | {output['tool']:15} | {output['size']:>8,}c (~{output['tokens']:>6,}t)")
        print(f"Preview: {output['preview'][:150]}...")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: analyze-session.py <session.jsonl>")
        sys.exit(1)
    analyze_session(sys.argv[1])
