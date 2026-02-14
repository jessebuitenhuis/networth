#!/bin/bash
# Start dev server, wait for ready, report port, kill server
npm run dev:random-port > /tmp/dev-check.log 2>&1 &
PID=$!

# Wait up to 15s for "ready" or "Local:" in output
for i in $(seq 1 30); do
  if grep -q "Local:" /tmp/dev-check.log 2>/dev/null; then
    PORT=$(grep -o 'localhost:[0-9]*' /tmp/dev-check.log | head -1 | cut -d: -f2)
    echo "✅ Dev server running on port $PORT"
    kill $PID 2>/dev/null
    exit 0
  fi
  sleep 0.5
done

echo "❌ Dev server failed to start within 15s"
cat /tmp/dev-check.log
kill $PID 2>/dev/null
exit 1
