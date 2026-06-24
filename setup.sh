#!/bin/bash

# App Compiler Setup Script
# This script sets up the development environment

set -e

echo "🔧 Setting up App Compiler..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ Docker: $(docker --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your OpenAI API key"
fi

# Create generated-apps directory
echo "📁 Creating generated-apps directory..."
mkdir -p generated-apps

# Create evaluation results directory
echo "📁 Creating evaluation/results directory..."
mkdir -p evaluation/results

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your OpenAI API key"
echo "2. Run: npm run dev (to start both backend and frontend)"
echo "3. Open: http://localhost:3000"
