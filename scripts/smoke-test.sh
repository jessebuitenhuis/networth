#!/bin/bash
# Smoke test: start the dev server and verify it responds to HTTP requests

set -e

LOG_FILE="/tmp/smoke-test.log"
PORT=3300

# Cleanup function
cleanup() {
    if [ -n "$APP_PID" ]; then
        kill $APP_PID 2>/dev/null || true
        wait $APP_PID 2>/dev/null || true
    fi
    rm -f "$LOG_FILE"
}

trap cleanup EXIT

# Start the dev server on a specific port
echo "Starting dev server on port $PORT..."
PORT=$PORT npm run dev > "$LOG_FILE" 2>&1 &
APP_PID=$!

# Wait up to 30s for the app to be ready
echo "Waiting for app to be ready..."
for i in $(seq 1 60); do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT" 2>/dev/null | grep -q "200\|304"; then
        echo "✅ App is responding on port $PORT"

        # Do a simple smoke test - verify the homepage loads
        RESPONSE=$(curl -s "http://localhost:$PORT")
        if echo "$RESPONSE" | grep -q "<!DOCTYPE html>\|<html"; then
            echo "✅ Homepage returns valid HTML"
            exit 0
        else
            echo "❌ Homepage did not return valid HTML"
            echo "Response preview:"
            echo "$RESPONSE" | head -c 500
            exit 1
        fi
    fi
    sleep 0.5
done

echo "❌ App failed to respond within 30s"
echo ""
echo "Server log:"
cat "$LOG_FILE"
exit 1
