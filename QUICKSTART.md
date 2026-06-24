# Quick Start Guide

## Installation & Setup

### 1. Prerequisites
```bash
# Required
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (for generated apps)
- OpenAI API key
```

### 2. Clone Repository
```bash
git clone https://github.com/vaish4991/app-compiler.git
cd app-compiler
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
```bash
cp .env.example .env

# Edit .env and add:
OPENAI_API_KEY=sk_...
OPENAI_MODEL=gpt-4
BACKEND_PORT=3001
```

## Development

### Start Local Environment
```bash
# Terminal 1: Backend
npm run dev:backend
# Backend API running at http://localhost:3001

# Terminal 2: Frontend
npm run dev:frontend
# Frontend running at http://localhost:3000

# Or use Docker Compose
docker-compose up
```

### Access UI
```
Open browser: http://localhost:3000
```

## Usage

### Web Interface
1. Open http://localhost:3000
2. Enter your app description (example below)
3. Click "Compile"
4. View results in real-time

### Example Prompts

#### CRM System
```
Build a CRM with login, contacts management, sales dashboard, 
role-based access (admin/sales/viewer), and premium plan with payments. 
Admins can see analytics.
```

#### E-commerce Platform
```
Create an e-commerce site with product catalog, shopping cart, 
user accounts, order history, payment processing, inventory management, 
and admin panel.
```

#### Project Management Tool
```
Build a project management app with tasks, teams, deadlines, 
notifications, file uploads, comments, and permission levels.
```

### API Usage

#### Compile Endpoint
```bash
curl -X POST http://localhost:3001/api/compile \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics."
  }'
```

**Response:**
```json
{
  "id": "app-uuid",
  "status": "success",
  "appId": "app-uuid",
  "config": {
    "appName": "CRM System",
    "entities": [...],
    "ui": {...},
    "api": {...},
    "database": {...},
    "auth": {...}
  },
  "metrics": {
    "stages": {
      "intent-extraction": { "duration": 2340, "success": true },
      "system-design": { "duration": 120, "success": true },
      "schema-generation": { "duration": 250, "success": true },
      "validation-repair": { "duration": 890, "success": true },
      "code-generation": { "duration": 1560, "success": true }
    },
    "totalDuration": 5160
  }
}
```

#### Check Status
```bash
curl http://localhost:3001/api/status/{compilation-id}
```

#### Get Metrics
```bash
curl http://localhost:3001/api/metrics
```

**Response:**
```json
{
  "totalCompilations": 42,
  "successCount": 40,
  "failureCount": 2,
  "successRate": 95.24,
  "averageLatency": 8234
}
```

## Running Generated Apps

### After Compilation
```bash
# Generated app is at: ./generated-apps/{appId}

cd generated-apps/{appId}
docker-compose up

# App is now running at http://localhost:3000
```

### Generated App Structure
```
{appId}/
├── package.json              # All dependencies
├── pages/                    # Next.js pages
│   ├── index.tsx            # Home page
│   ├── login.tsx            # Login page
│   └── api/
│       ├── auth/login.ts    # Auth endpoints
│       └── [entity].ts      # Entity endpoints
├── migrations/              # SQL migrations
│   ├── 001-create-users.sql
│   └── 002-create-contacts.sql
├── docker-compose.yml       # Local dev setup
├── Dockerfile               # App container
└── .env.local              # Environment config
```

## Evaluation

### Run Test Suite
```bash
npm run evaluate
```

**Output:**
```
=== EVALUATION SUMMARY ===
Total Tests: 20
Success Count: 19
Failure Count: 1
Success Rate: 95.00%
Average Latency: 8234ms

=== RESULTS BY CATEGORY ===
Real Products:
  Total: 10
  Success: 10
  Rate: 100%

Edge Cases:
  Total: 10
  Success: 9
  Rate: 90%
```

### View Results
```bash
cat evaluation/results.json
```

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/compile` | POST | Compile prompt to app |
| `/api/status/:id` | GET | Get compilation status |
| `/api/metrics` | GET | Get system metrics |
| `/api/compilations` | GET | List all compilations |
| `/api/app/:appId/files` | GET | Get generated files |
| `/health` | GET | Health check |

### Request/Response Examples

#### POST /api/compile
```javascript
// Request
{
  "prompt": "Build a CRM with..."
}

// Response (Success)
{
  "id": "uuid",
  "status": "success",
  "appId": "app-uuid",
  "config": {...},
  "metrics": {...}
}

// Response (Error)
{
  "id": "uuid",
  "status": "failed",
  "error": "Prompt too vague",
  "metrics": {...}
}
```

## Troubleshooting

### Issue: "Invalid OpenAI API Key"
```bash
# Solution: Check .env
echo $OPENAI_API_KEY
# Should output your key, not empty
```

### Issue: "Port 3000/3001 already in use"
```bash
# Solution: Kill existing process
lsof -i :3000  # Find process using port 3000
kill -9 <PID>   # Kill it
```

### Issue: "Generated app won't start"
```bash
# Debug: Check files exist
cd generated-apps/{appId}
ls -la

# Verify Docker setup
docker-compose config

# Check logs
docker-compose logs app
```

### Issue: "Database migration failed"
```bash
# Solution: Check PostgreSQL is running
docker ps | grep postgres

# Check migrations exist
ls -la migrations/

# Manual migration
psql -U postgres < migrations/001-create-users.sql
```

## Performance Tips

### 1. Cache Intent Mappings
```typescript
// In production, cache Stage 1 → Stage 2 outputs
const cache = new Map();
// Reduces latency from 8s → 5s for cached prompts
```

### 2. Parallel Schema Generation
```typescript
// Generate all 4 schemas in parallel
await Promise.all([...]) 
// Reduces latency from 8s → 6s
```

### 3. Use Simpler Model for Testing
```bash
# Use GPT-3.5-turbo instead of GPT-4 for dev
OPENAI_MODEL=gpt-3.5-turbo
# Faster but less accurate (use GPT-4 for production)
```

## Advanced Usage

### Programmatic Usage
```typescript
import { compilePrompt } from './backend/utils/compiler';

const result = await compilePrompt(
  "Build a CRM with login, contacts, and dashboard"
);

if (result.success) {
  console.log(`App ID: ${result.appId}`);
  console.log(`Total Time: ${result.metrics.totalDuration}ms`);
  console.log(`Config:`, result.config);
}
```

### Custom Evaluation
```typescript
import { compilePrompt } from './backend/utils/compiler';

const testCases = [
  { name: 'CRM', prompt: '...' },
  { name: 'Blog', prompt: '...' },
];

const results = [];
for (const test of testCases) {
  const result = await compilePrompt(test.prompt);
  results.push({
    name: test.name,
    success: result.success,
    latency: result.metrics.totalDuration,
  });
}

console.table(results);
```

## Architecture Overview

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md)

For system design decisions, see [SYSTEM_INSTRUCTIONS.md](./SYSTEM_INSTRUCTIONS.md)

## Contributing

### File Structure
```
backend/
  stages/           # 5-stage pipeline
  schemas/          # Type definitions
  validation/       # Validation logic
  generator/        # Code generation
  utils/            # Utilities
  api/              # API endpoints

frontend/
  pages/            # UI pages
  components/       # React components
  styles/           # CSS

evaluation/
  test-cases.ts     # 20 test prompts
  run-evaluation.ts # Test runner
  results.json      # Results & metrics
```

### Making Changes

1. **New test case**: Add to `evaluation/test-cases.ts`
2. **New validation rule**: Add to `backend/validation/consistency-checker.ts`
3. **New schema field**: Update Zod schema + repair logic
4. **New endpoint**: Add to `backend/api/routes.ts`

## Support

For issues or questions:
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Check [SYSTEM_INSTRUCTIONS.md](./SYSTEM_INSTRUCTIONS.md)
3. Open issue on GitHub

---

**Ready to compile? Start with the web UI at http://localhost:3000!**
