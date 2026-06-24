import { z } from 'zod';

// Core entity definition
export const EntitySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['user', 'admin', 'customer', 'product', 'order', 'payment', 'subscription', 'custom']),
  fields: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'date', 'email', 'password', 'json', 'enum']),
    required: z.boolean(),
    validation: z.record(z.any()).optional(),
    enumValues: z.array(z.string()).optional(),
  })),
  relationships: z.array(z.object({
    targetEntity: z.string(),
    type: z.enum(['one-to-one', 'one-to-many', 'many-to-many']),
    foreignKey: z.string().optional(),
  })).optional(),
  timestamps: z.boolean().default(true),
});

export type Entity = z.infer<typeof EntitySchema>;

// Feature definition
export const FeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
  entities: z.array(z.string()),
  authRequired: z.boolean().default(false),
  premiumOnly: z.boolean().default(false),
});

export type Feature = z.infer<typeof FeatureSchema>;

// Intent extraction output
export const IntentOutputSchema = z.object({
  appName: z.string(),
  description: z.string(),
  entities: z.array(EntitySchema),
  features: z.array(FeatureSchema),
  authModel: z.enum(['none', 'basic', 'oauth', 'rbac']),
  monetization: z.enum(['free', 'freemium', 'subscription', 'one-time']).optional(),
  adminDashboard: z.boolean().default(false),
  analytics: z.boolean().default(false),
});

export type IntentOutput = z.infer<typeof IntentOutputSchema>;

// Page definition for UI
export const PageSchema = z.object({
  name: z.string(),
  route: z.string(),
  layout: z.enum(['single', 'two-column', 'three-column', 'dashboard']),
  components: z.array(z.object({
    id: z.string(),
    type: z.enum(['form', 'table', 'chart', 'list', 'detail', 'hero', 'nav', 'card']),
    entity: z.string().optional(),
    props: z.record(z.any()).optional(),
  })),
  authRequired: z.boolean().default(false),
  requiredRoles: z.array(z.string()).optional(),
});

export type Page = z.infer<typeof PageSchema>;

// Complete app configuration
export const AppConfigSchema = z.object({
  id: z.string().uuid(),
  appName: z.string(),
  description: z.string(),
  version: z.string().default('1.0.0'),
  
  // Core data
  entities: z.array(EntitySchema),
  features: z.array(FeatureSchema),
  
  // UI
  ui: z.object({
    pages: z.array(PageSchema),
    components: z.record(z.any()),
    theme: z.record(z.any()).optional(),
  }),
  
  // API
  api: z.object({
    endpoints: z.array(z.object({
      path: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
      entity: z.string(),
      action: z.enum(['list', 'get', 'create', 'update', 'delete', 'custom']),
      requiredRoles: z.array(z.string()).optional(),
      validation: z.record(z.any()).optional(),
    })),
    baseUrl: z.string().default('/api'),
  }),
  
  // Database
  database: z.object({
    type: z.literal('postgresql'),
    tables: z.array(z.object({
      name: z.string(),
      entity: z.string(),
      columns: z.array(z.object({
        name: z.string(),
        type: z.string(),
        nullable: z.boolean(),
        primaryKey: z.boolean().optional(),
        unique: z.boolean().optional(),
      })),
      indexes: z.array(z.string()).optional(),
    })),
  }),
  
  // Authentication & Authorization
  auth: z.object({
    type: z.enum(['jwt', 'session', 'oauth']),
    roles: z.array(z.object({
      name: z.string(),
      permissions: z.array(z.string()),
    })),
    defaultRole: z.string(),
  }),
  
  // Business logic
  businessLogic: z.object({
    premiumGating: z.array(z.object({
      feature: z.string(),
      requiresPremium: z.boolean(),
    })).optional(),
    workflows: z.array(z.object({
      name: z.string(),
      trigger: z.string(),
      steps: z.array(z.string()),
    })).optional(),
  }),
  
  timestamp: z.date(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
