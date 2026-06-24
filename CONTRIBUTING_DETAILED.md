# Contributing to App Compiler

We welcome contributions! Here's how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your OpenAI API key

# Start development
npm run dev
```

## Project Structure

```
app-compiler/
├── backend/
│   ├── stages/          # 5-stage pipeline
│   ├── schemas/         # Zod type definitions
│   ├── validation/      # Validation logic
│   ├── generator/       # Code generation
│   ├── utils/           # Utilities
│   └── api/             # REST endpoints
├── frontend/
│   ├── pages/           # Next.js pages
│   ├── components/      # React components
│   └── styles/          # CSS
├── evaluation/
│   ├── test-cases.ts    # 20 test prompts
│   ├── run-evaluation.ts # Test runner
│   └── results.json     # Results & metrics
└── docs/
    ├── ARCHITECTURE.md
    ├── SYSTEM_INSTRUCTIONS.md
    └── QUICKSTART.md
```

## Code Guidelines

### TypeScript
- Strict mode enabled
- Type all function parameters and returns
- Use Zod for runtime validation

### File Naming
- Files: kebab-case (`intent-extraction.ts`)
- Functions: camelCase (`extractIntent`)
- Types: PascalCase (`IntentOutput`)
- Constants: UPPER_SNAKE_CASE (`DESIGN_RULES`)

### Error Handling
- Use custom error classes (ValidationError, RepairError)
- Always provide helpful error messages
- Log errors with context

## Testing

### Unit Tests
```bash
npm test -- backend/stages/01-intent-extraction.test.ts
```

### Integration Tests
```bash
npm test -- backend/utils/compiler.test.ts
```

### Full Evaluation
```bash
npm run evaluate
```

## Adding Features

### New Validation Rule

1. Add rule to `backend/validation/consistency-checker.ts`
2. Write test
3. Update repair logic if needed
4. Document in ARCHITECTURE.md

### New Stage

1. Create `backend/stages/06-new-stage.ts`
2. Export function with consistent interface
3. Add to compiler pipeline
4. Add tests and metrics

### New Test Case

1. Add to `evaluation/test-cases.ts`
2. Mark as 'real-product' or 'edge-case'
3. Add expected features
4. Run `npm run evaluate`

## Pull Request Process

1. Update documentation
2. Add/update tests
3. Verify all tests pass
4. Run evaluation suite
5. Submit PR with clear description

## Code Review

All PRs require review. We look for:
- ✓ Clear, concise code
- ✓ Comprehensive tests
- ✓ Updated documentation
- ✓ No breaking changes
- ✓ Consistent style

## Performance

- Profile new code with 100+ test cases
- Target: <15 seconds total latency
- Target: <$0.10 cost per app
- Target: 95%+ success rate

## Documentation

- Update README for user-facing changes
- Update ARCHITECTURE.md for system changes
- Add inline comments for complex logic
- Keep docs in sync with code

## Questions?

Open an issue or discussion. We're here to help!

## License

MIT License - See LICENSE file
