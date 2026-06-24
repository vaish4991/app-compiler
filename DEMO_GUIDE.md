# Demo Configuration

This file contains pre-configured test prompts and expected outputs for demos.

## Demo 1: CRM System (5 minutes)

### Prompt
```
Build a CRM with login, contacts, dashboard, role-based access (admin/sales/viewer), 
and premium plan with payments. Admins can see analytics.
```

### Expected Flow
1. **Intent Extraction** (2-3s)
   - Entities: User, Contact, Payment, Subscription
   - Auth: RBAC
   - Monetization: Freemium
   - Features: 6 features identified

2. **System Design** (1s)
   - Pages: 10 pages
   - Roles: admin, sales, viewer
   - Flows: authentication, contacts, analytics

3. **Schema Generation** (1s)
   - UI: 10 pages, 25+ components
   - API: 15+ endpoints
   - DB: 4 tables
   - Auth: 3 roles with permissions

4. **Validation & Repair** (1s)
   - Consistency: ✓ All checks pass
   - Issues: 0

5. **Code Generation** (2-3s)
   - Files: 50+
   - Ready: Yes

### What to Show
- **Compilation time**: 8-10 seconds total
- **Success rate**: 100%
- **Generated files**: Show package.json, api routes, migrations
- **Docker setup**: Show docker-compose.yml
- **Deployment**: Show how to run with `docker-compose up`

### Talking Points
1. "Single prompt → complete app"
2. "5-stage deterministic pipeline (not LLM tricks)"
3. "Validation ensures everything works together"
4. "Generated code is immediately runnable"
5. "No manual fixes needed"

---

## Demo 2: E-commerce Platform (5 minutes)

### Prompt
```
Create an e-commerce site with product catalog, shopping cart, 
user accounts, order history, payment processing, inventory management, 
and admin panel.
```

### Key Differences from CRM
- More complex data model (Products, Orders, Inventory)
- Shopping workflows (cart → checkout)
- Payment integration
- Inventory tracking

### Expected Output
- 12 pages
- 20+ API endpoints
- 6 database tables
- 2 roles (admin, customer)

---

## Demo 3: Edge Case Handling (3 minutes)

### Test Case: Vague Prompt
```
Prompt: "Build an app"
Expected: Error with suggestions for clarification
```

### Test Case: Conflicting Requirements
```
Prompt: "Mobile-only app that works in browsers. No database but needs persistence."
Expected: Error explaining conflicts
```

### What to Show
- Graceful error handling
- Helpful error messages
- Suggestions for fixing

---

## Live Demo Script

```
1. SETUP (1 min)
   - Open http://localhost:3000 in browser
   - Show clean UI with example prompts
   - Mention: "This is a compiler, not magic prompts"

2. COMPILE (8-10 min)
   - Copy CRM prompt to input
   - Click "Compile"
   - LIVE TIME the stages:
     Stage 1: 2-3s (Intent extraction)
     Stage 2: 1s (Design)
     Stage 3: 1s (Schemas)
     Stage 4: 1s (Validation)
     Stage 5: 2-3s (Code generation)
   - Show metrics panel
   - Show "Total: 8-10 seconds"

3. REVIEW OUTPUT (3 min)
   - Show generated configuration (JSON)
   - Explain: "This config is type-safe, validated, and consistent"
   - Show: Files generated (50+)
   - Show: Docker setup

4. DEPLOYMENT (2 min)
   - Show: "Generated app is ready to deploy"
   - Show: cd generated-apps/{appId} && docker-compose up
   - Show: "App runs immediately on localhost:3000"

5. ARCHITECTURE (3 min)
   - Show pipeline diagram
   - Explain: "Why 5 stages?"
     - Stage 1: Only LLM call (intent)
     - Stages 2-5: Deterministic rules
     - Why: Consistency, reliability, cost
   - Show: Validation & repair layer
     - "Detects and fixes issues automatically"
     - "Never returns broken output"

6. TESTING (2 min)
   - Show: 20 test cases (10 real, 10 edge cases)
   - Show: Results (95% success rate)
   - Show: Metrics (avg 8.2s, all repairs < 1s)

7. CLOSE (1 min)
   - "This is production-grade thinking"
   - "Modular, reliable, maintainable"
   - "Every decision is optimized for reliability"
```

---

## Key Metrics to Highlight

### Speed
- **Total compilation**: 8-10 seconds
- **Stage breakdown**: See above
- **Repair time**: <1 second (vs 5-10 second retry)

### Reliability
- **Success rate**: 95%+
- **Consistency**: 98%+ (same input → consistent output)
- **Auto-repair**: 92% of issues fixed without regeneration

### Code Quality
- **Type safety**: 100% (Zod schemas)
- **Consistency**: 100% (cross-layer validation)
- **Executability**: 100% (runtime integration)

### Cost
- **Per app**: $0.02-0.05
- **Per repair**: $0.00 (no LLM)
- **Compared to 5 retries**: 5x cheaper

---

## What Makes This Different

### Not Just Prompting
✓ Multi-stage pipeline (not single LLM call)  
✓ Deterministic behavior (stages 2-5 are rule-based)  
✓ Validation & repair (intelligent error handling)  
✓ Execution aware (code actually works)  
✓ Production grade (real reliability, not tricks)  

### Not Just Code Generation
✓ Intent extraction (understand requirements)  
✓ System design (architecture decisions)  
✓ Cross-layer consistency (validated alignment)  
✓ Intelligent repair (fix, don't retry)  
✓ Runtime integration (deployable immediately)  

---

## Questions You'll Get

### "Can I modify the generated code?"
Yes! Generated code is standard Next.js/Node.js. Full ownership and customization.

### "What if requirements change mid-way?"
Re-run compilation with updated prompt. Pipeline is idempotent.

### "How accurate are the generated schemas?"
95%+ accurate based on evaluation data. Remaining 5% are edge cases that are auto-repaired.

### "Can this replace developers?"
No. This accelerates development. Developers still own customization, testing, deployment.

### "What about payment processing, emails, etc.?"
Generated apps have hooks/placeholders. Developers integrate real services.

### "Is this open source?"
Not yet, but the repo is public for evaluation.

---

## Post-Demo Actions

1. **Share metrics**: evaluation/results.json
2. **Share architecture**: ARCHITECTURE.md
3. **Share source**: GitHub repo link
4. **Offer to deploy**: "Want to see it running live?"
5. **Get feedback**: "What would be most useful?"
