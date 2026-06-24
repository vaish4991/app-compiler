import { OpenAI } from 'openai';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.ts';
import { UISchemaOutput } from '../schemas/ui-schema.ts';
import { APISchemaOutput } from '../schemas/api-schema.ts';
import { DBSchemaOutput } from '../schemas/db-schema.ts';
import { AuthSchemaOutput } from '../schemas/auth-schema.ts';
import { type IntentOutput, type Entity } from '../schemas/app-config.schema.ts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SchemaGenerationOutput {
  ui: z.infer<typeof UISchemaOutput>;
  api: z.infer<typeof APISchemaOutput>;
  database: z.infer<typeof DBSchemaOutput>;
  auth: z.infer<typeof AuthSchemaOutput>;
}

function generateUISchema(intent: IntentOutput): z.infer<typeof UISchemaOutput> {
  logger.info('Generating UI Schema');

  const pages = [
    {
      name: 'home',
      route: '/',
      title: 'Home',
      layout: 'single' as const,
      components: ['hero', 'nav'],
      authRequired: false,
    },
  ];

  if (intent.authModel !== 'none') {
    pages.push({
      name: 'login',
      route: '/login',
      title: 'Login',
      layout: 'single' as const,
      components: ['login-form'],
      authRequired: false,
    });
    pages.push({
      name: 'signup',
      route: '/signup',
      title: 'Sign Up',
      layout: 'single' as const,
      components: ['signup-form'],
      authRequired: false,
    });
  }

  // Add entity pages
  for (const entity of intent.entities) {
    const lowerName = entity.name.toLowerCase();
    pages.push({
      name: `${lowerName}-list`,
      route: `/${lowerName}s`,
      title: `${entity.name}s`,
      layout: 'single' as const,
      components: [`${lowerName}-table`, `${lowerName}-filters`],
      authRequired: true,
    });

    pages.push({
      name: `${lowerName}-detail`,
      route: `/${lowerName}s/[id]`,
      title: `${entity.name} Detail`,
      layout: 'single' as const,
      components: [`${lowerName}-form`],
      authRequired: true,
    });
  }

  if (intent.adminDashboard) {
    pages.push({
      name: 'admin',
      route: '/admin',
      title: 'Admin Dashboard',
      layout: 'dashboard' as const,
      components: ['admin-stats', 'user-management', 'analytics'],
      authRequired: true,
      requiredRoles: ['admin'],
    });
  }

  const components = new Map();
  components.set('nav', {
    id: 'nav',
    type: 'nav' as const,
    props: { items: ['home', 'profile', 'logout'] },
  });

  components.set('hero', {
    id: 'hero',
    type: 'hero' as const,
    props: { title: intent.appName, subtitle: intent.description },
  });

  // Add entity-specific components
  for (const entity of intent.entities) {
    const lowerName = entity.name.toLowerCase();
    components.set(`${lowerName}-table`, {
      id: `${lowerName}-table`,
      type: 'table' as const,
      entity: entity.name,
      columns: entity.fields.slice(0, 3).map(f => ({
        key: f.name,
        label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
        type: f.type,
        sortable: true,
      })),
    });

    components.set(`${lowerName}-form`, {
      id: `${lowerName}-form`,
      type: 'form' as const,
      entity: entity.name,
      fields: entity.fields.map(f => ({
        name: f.name,
        label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
        type: 'text' as const,
        required: f.required,
      })),
    });
  }

  return {
    pages,
    components,
  };
}

function generateAPISchema(intent: IntentOutput): z.infer<typeof APISchemaOutput> {
  logger.info('Generating API Schema');

  const endpoints = [];

  // Auth endpoints
  if (intent.authModel !== 'none') {
    endpoints.push(
      {
        id: uuidv4(),
        path: '/auth/login',
        method: 'POST' as const,
        name: 'login',
        entity: 'user',
        action: 'custom' as const,
        requestSchema: { body: { email: 'string', password: 'string' } },
        responseSchema: { status: 200, data: { token: 'string', user: {} } },
        authRequired: false,
      },
      {
        id: uuidv4(),
        path: '/auth/signup',
        method: 'POST' as const,
        name: 'signup',
        entity: 'user',
        action: 'custom' as const,
        requestSchema: { body: { email: 'string', password: 'string' } },
        responseSchema: { status: 201, data: { token: 'string', user: {} } },
        authRequired: false,
      }
    );
  }

  // Entity endpoints
  for (const entity of intent.entities) {
    endpoints.push(
      {
        id: uuidv4(),
        path: `/api/${entity.name.toLowerCase()}s`,
        method: 'GET' as const,
        name: `list-${entity.name}s`,
        entity: entity.name,
        action: 'list' as const,
        responseSchema: { status: 200, data: { items: [] } },
        authRequired: intent.authModel !== 'none',
      },
      {
        id: uuidv4(),
        path: `/api/${entity.name.toLowerCase()}s/:id`,
        method: 'GET' as const,
        name: `get-${entity.name}`,
        entity: entity.name,
        action: 'get' as const,
        responseSchema: { status: 200, data: {} },
        authRequired: intent.authModel !== 'none',
      },
      {
        id: uuidv4(),
        path: `/api/${entity.name.toLowerCase()}s`,
        method: 'POST' as const,
        name: `create-${entity.name}`,
        entity: entity.name,
        action: 'create' as const,
        responseSchema: { status: 201, data: {} },
        authRequired: intent.authModel !== 'none',
      }
    );
  }

  return {
    baseUrl: '/api',
    version: '1.0.0',
    endpoints,
    authentication: intent.authModel !== 'none' ? { type: 'jwt' as const } : undefined,
  };
}

function generateDBSchema(entities: Entity[]): z.infer<typeof DBSchemaOutput> {
  logger.info('Generating Database Schema');

  const tables = entities.map(entity => ({
    name: entity.name.toLowerCase() + 's',
    displayName: entity.name,
    entity: entity.name,
    columns: [
      {
        name: 'id',
        type: 'uuid' as const,
        nullable: false,
        primaryKey: true,
        unique: true,
      },
      ...entity.fields.map(field => ({
        name: field.name,
        type: mapFieldTypeToSQL(field.type),
        nullable: !field.required,
        unique: false,
      })),
      {
        name: 'created_at',
        type: 'timestamp' as const,
        nullable: false,
        default: 'CURRENT_TIMESTAMP',
      },
      {
        name: 'updated_at',
        type: 'timestamp' as const,
        nullable: false,
        default: 'CURRENT_TIMESTAMP',
      },
    ],
    timestamps: true,
  }));

  return {
    type: 'postgresql' as const,
    version: '14',
    tables,
  };
}

function generateAuthSchema(intent: IntentOutput): z.infer<typeof AuthSchemaOutput> {
  logger.info('Generating Auth Schema');

  const roles = [
    {
      name: 'admin',
      displayName: 'Administrator',
      permissions: ['read:*', 'create:*', 'update:*', 'delete:*'],
    },
    {
      name: 'user',
      displayName: 'User',
      permissions: ['read:own', 'update:own'],
    },
  ];

  if (intent.authModel === 'none') {
    return {
      type: 'jwt' as const,
      roles: [],
      permissions: [],
      defaultRole: 'guest',
    };
  }

  return {
    type: 'jwt' as const,
    jwt: {
      algorithm: 'HS256',
      expiresIn: '7d',
      refreshTokenExpiry: '30d',
    },
    roles,
    permissions: [],
    defaultRole: 'user',
  };
}

function mapFieldTypeToSQL(fieldType: string): string {
  const mapping: Record<string, string> = {
    'string': 'varchar',
    'number': 'integer',
    'boolean': 'boolean',
    'date': 'date',
    'email': 'varchar',
    'password': 'varchar',
    'json': 'json',
    'enum': 'varchar',
  };
  return mapping[fieldType] || 'varchar';
}

export async function generateSchemas(intent: IntentOutput): Promise<SchemaGenerationOutput> {
  logger.info('Stage 3: Schema Generation', { appName: intent.appName });

  try {
    const ui = generateUISchema(intent);
    const api = generateAPISchema(intent);
    const database = generateDBSchema(intent.entities);
    const auth = generateAuthSchema(intent);

    logger.info('Stage 3: Schema Generation - Success', {
      pageCount: ui.pages.length,
      endpointCount: api.endpoints.length,
      tableCount: database.tables.length,
    });

    return { ui, api, database, auth };
  } catch (error) {
    logger.error('Stage 3: Schema Generation - Error', { error: String(error) });
    throw error;
  }
}
