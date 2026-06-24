#!/bin/bash

# Run comprehensive evaluation
# This script runs all test cases and generates a report

echo "🧪 Starting App Compiler Evaluation"
echo "==================================="
echo ""

# Check environment
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set"
    exit 1
fi

echo "✅ Environment check passed"
echo ""

# Run evaluation
echo "📊 Running evaluation with 20 test cases..."
echo ""

npm run evaluate

echo ""
echo "📈 Evaluation complete!"
echo "📁 Results saved to: evaluation/results.json"
echo ""

# Display summary
echo "📋 Results Summary:"
echo ""

if [ -f evaluation/results.json ]; then
    # Use jq if available, otherwise use node
    if command -v jq &> /dev/null; then
        jq '.summary' evaluation/results.json
    else
        echo "(Install jq to see formatted results)"
        echo "Or check: evaluation/results.json"
    fi
fi

echo ""
echo "✅ Evaluation finished!"
