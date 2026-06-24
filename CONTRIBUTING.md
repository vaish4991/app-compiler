# Contributing Guidelines

## Code Style

### TypeScript
- Strict mode enabled
- ESLint configured
- Prettier formatting

```bash
# Format code
npm run format

# Lint
npm run lint

# Type check
npm run type-check
```

### Naming Conventions
- Files: kebab-case (`intent-extraction.ts`)
- Functions: camelCase (`extractIntent`)
- Classes: PascalCase (`IntentOutput`)
- Constants: UPPER_SNAKE_CASE (`DESIGN_RULES`)

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Test thoroughly

# Commit with clear message
git commit -m "feat: Add new validation rule"

# Push
git push origin feature/your-feature

# Open PR
```

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

## Adding New Features

### New Stage
1. Create file: `backend/stages/06-new-stage.ts`
2. Export function matching pattern
3. Add to compiler pipeline
4. Add tests
5. Update metrics

### New Validation Rule
1. Add to `backend/validation/consistency-checker.ts`
2. Write test
3. Update repair logic
4. Document in ARCHITECTURE.md

## Performance Considerations

- Keep LLM calls minimal (only Stage 1)
- Use caching where possible
- Profile with 100+ test cases
- Track latency by stage

## Documentation

- Update README for user-facing changes
- Update ARCHITECTURE.md for system changes
- Update SYSTEM_INSTRUCTIONS.md for design decisions
- Add inline comments for complex logic

---

**Questions? Open an issue!**
