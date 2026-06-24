import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.ts';
import { type AppConfig } from '../schemas/app-config.schema.ts';

interface GeneratedApp {
  id: string;
  path: string;
  packageJson: string;
  nextPages: Map<string, string>;
  apiRoutes: Map<string, string>;
  dbMigrations: Map<string, string>;
  dockerCompose: string;
  env: string;
}

export async function generateApp(config: AppConfig): Promise<GeneratedApp> {
  logger.info('Stage 5: Code Generation', { appName: config.appName });

  const appId = uuidv4();
  const appDir = `./generated-apps/${appId}`;

  try {
    // Create directory structure
    await createDirectoryStructure(appDir);

    // Generate package.json
    const packageJson = generatePackageJson(config);
    await fs.writeFile(path.join(appDir, 'package.json'), packageJson);

    // Generate Next.js pages
    const pages = new Map<string, string>();
    for (const page of config.ui.pages) {
      const pageCode = generateNextPage(page, config);
      pages.set(page.route, pageCode);
      const pagePath = path.join(appDir, 'pages', `${page.name}.tsx`);
      await fs.writeFile(pagePath, pageCode);
    }

    // Generate API routes
    const apiRoutes = new Map<string, string>();
    for (const endpoint of config.api.endpoints) {
      const routeCode = generateApiRoute(endpoint, config);
      apiRoutes.set(endpoint.path, routeCode);
      const routePath = path.join(appDir, 'pages/api', `${endpoint.name}.ts`);
      await fs.mkdir(path.dirname(routePath), { recursive: true });
      await fs.writeFile(routePath, routeCode);
    }

    // Generate database migrations
    const migrations = new Map<string, string>();
    for (const table of config.database.tables) {
      const migrationCode = generateMigration(table, config);
      migrations.set(table.name, migrationCode);
      const migrationPath = path.join(appDir, 'migrations', `001-create-${table.name}.sql`);
      await fs.mkdir(path.dirname(migrationPath), { recursive: true });
      await fs.writeFile(migrationPath, migrationCode);
    }

    // Generate Docker Compose
    const dockerCompose = generateDockerCompose(config);
    await fs.writeFile(path.join(appDir, 'docker-compose.yml'), dockerCompose);

    // Generate .env
    const env = generateEnvFile(config, appId);
    await fs.writeFile(path.join(appDir, '.env.local'), env);

    logger.info('Stage 5: Code Generation - Success', { appId, appDir });

    return {
      id: appId,
      path: appDir,
      packageJson,
      nextPages: pages,
      apiRoutes,
      dbMigrations: migrations,
      dockerCompose,
      env,
    };
  } catch (error) {
    logger.error('Stage 5: Code Generation - Error', { error: String(error) });
    throw error;
  }
}

async function createDirectoryStructure(appDir: string): Promise<void> {
  const dirs = [
    appDir,
    path.join(appDir, 'pages'),
    path.join(appDir, 'pages/api'),
    path.join(appDir, 'components'),
    path.join(appDir, 'lib'),
    path.join(appDir, 'lib/db'),
    path.join(appDir, 'migrations'),
    path.join(appDir, 'public'),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

function generatePackageJson(config: AppConfig): string {
  const pkg = {
    name: config.appName.toLowerCase().replace(/\s+/g, '-'),
    version: config.version,
    description: config.description,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      'next': '^14.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'postgres': '^3.4.0',
      'jsonwebtoken': '^9.1.0',
      'dotenv': '^16.3.1',
    },
    devDependencies: {
      'typescript': '^5.3.3',
      '@types/node': '^20.10.5',
      '@types/react': '^18.2.45',
    },
  };

  return JSON.stringify(pkg, null, 2);
}

function generateNextPage(page: any, config: AppConfig): string {
  return `import React from 'react';
import { useRouter } from 'next/router';

export default function ${toPascalCase(page.name)}Page() {
  const router = useRouter();
  
  return (
    <div className="page page-${page.name}">
      <h1>${page.title}</h1>
      <p>${page.description || 'Page for ' + page.name}</p>
    </div>
  );
}
`;
}

function generateApiRoute(endpoint: any, config: AppConfig): string {
  return `import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== '${endpoint.method}') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: Implement ${endpoint.name} endpoint
    res.status(200).json({ message: '${endpoint.name} endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
`;
}

function generateMigration(table: any, config: AppConfig): string {
  const columnDefs = table.columns
    .map((col: any) => {
      let def = `${col.name} ${col.type.toUpperCase()}`;
      if (col.primaryKey) def += ' PRIMARY KEY';
      if (!col.nullable) def += ' NOT NULL';
      if (col.unique) def += ' UNIQUE';
      if (col.default) def += ` DEFAULT ${col.default}`;
      return def;
    })
    .join(',\n  ');

  return `-- Create ${table.name} table
CREATE TABLE ${table.name} (
  ${columnDefs}
);

-- Add indexes
${table.indexes?.map((idx: any) => `CREATE INDEX idx_${idx.name} ON ${table.name} (${idx.columns.join(', ')});`).join('\n')}
`;
}

function generateDockerCompose(config: AppConfig): string {
  return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app_db
      - NODE_ENV=development
    depends_on:
      - db
    volumes:
      - .:/app

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;
}

function generateEnvFile(config: AppConfig, appId: string): string {
  return `# Generated for ${config.appName}
APP_ID=${appId}
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
NODE_ENV=development
JWT_SECRET=generated-secret-${appId}
`;
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
