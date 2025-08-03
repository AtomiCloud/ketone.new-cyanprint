#!/usr/bin/env bash

set -eou pipefail

# Function to test container with expected log content
test_container() {
  local name="$1"
  local path="$2"
  local expected_log="$3"

  echo "🔨 Building $name..."
  if ! docker build -t "$name" "$path"; then
    echo "❌ Failed to build $name"
    exit 1
  fi

  echo "🧪 Testing $name (expecting log containing: $expected_log)..."

  # Start container in background and capture container ID
  container_id=$(docker run -d --rm "$name")

  sleep 0.5
  output=$(docker logs "$container_id" 2>/dev/null)

  # If we found the expected log, exit early
  if echo "$output" | grep -q "$expected_log"; then
    docker kill "$container_id" >/dev/null 2>&1 || true
    echo "✅ $name works (found: $expected_log)"
    echo "📝 Output: $output"
    echo ""
    return 0
  fi

  # Kill the container
  docker kill "$container_id" >/dev/null 2>&1 || true

  # Check if expected log content is present
  if echo "$output" | grep -q "$expected_log"; then
    echo "✅ $name works (found: $expected_log)"
    echo "📝 Output: $output"
  else
    echo "❌ $name failed - expected log containing '$expected_log' not found"
    echo "📝 Output: $output"
    echo "❌ Test fails"
    exit 1
  fi
  echo ""
}

echo "🎯 Testing CyanPrint containers with expected log content:"
echo "   - Processors: 5551"
echo "   - Plugins: 5552"
echo "   - Templates: 5550"
echo ""

# Test Templates (expect logs containing 5550)
test_container "template-py" "./template/python/cyan" "5550"
test_container "template-dotnet" "./template/dotnet/cyan" "5550"
test_container "template-js" "./template/javascript/cyan" "5550"
test_container "template-ts" "./template/typescript/cyan" "5550"

# Test Processors (expect logs containing 5551)
test_container "processor-ts" "./processor/typescript" "5551"
test_container "processor-js" "./processor/javascript" "5551"
test_container "processor-py" "./processor/python" "5551"
test_container "processor-dotnet" "./processor/dotnet" "5551"

# Test Plugins (expect logs containing 5552)
test_container "plugin-ts" "./plugin/typescript" "5552"
test_container "plugin-js" "./plugin/javascript" "5552"
test_container "plugin-py" "./plugin/python" "5552"
test_container "plugin-dotnet" "./plugin/dotnet" "5552"

echo "✅ All containers passed with correct log content!"
