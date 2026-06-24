import { z } from 'zod';
import { logger } from '../utils/logger.ts';
import { AppConfigSchema, type AppConfig } from '../schemas/app-config.schema.ts';
import { type IntentOutput } from '../schemas/app-config.schema.ts';
import { ValidationError, RepairError } from '../schemas/errors.ts';

interface ValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning';
  fixable: boolean;
  suggestedFix?: any;
}

interface ConsistencyIssue {
  type: 'api-db-mismatch' | 'ui-api-mismatch' | 'auth-mismatch' | 'field-type-mismatch';
  description: string;
  affected: string[];
  fixable: boolean;
}

export async function validateAppConfig(config: Partial<AppConfig>): Promise<ValidationIssue[]> {
  logger.info('Stage 4: Validation - Checking Schema');

  const issues: ValidationIssue[] = [];

  try {
    // First, validate against Zod schema
    await AppConfigSchema.parseAsync(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        issues.push({
          path: issue.path.join('.'),
          message: issue.message,
          severity: 'error',
          fixable: canFixIssue(issue),
          suggestedFix: getSuggestedFix(issue, config),
        });
      }
    }
  }

  return issues;
}

export async function checkConsistency(config: Partial<AppConfig>): Promise<ConsistencyIssue[]> {
  logger.info('Stage 4: Validation - Checking Consistency');

  const issues: ConsistencyIssue[] = [];

  try {
    // Check API-DB consistency
    if (config.api && config.database) {
      for (const endpoint of config.api.endpoints || []) {
        const table = config.database.tables?.find(t => t.entity === endpoint.entity);
        if (!table) {
          issues.push({
            type: 'api-db-mismatch',
            description: `API endpoint references entity '${endpoint.entity}' but no table found`,
            affected: [endpoint.path],
            fixable: true,
          });
        }
      }
    }

    // Check UI-API consistency
    if (config.ui && config.api) {
      for (const page of config.ui.pages || []) {
        for (const componentId of page.components || []) {
          const component = config.ui.components?.get(componentId);
          if (!component && componentId !== 'nav' && componentId !== 'hero') {
            issues.push({
              type: 'ui-api-mismatch',
              description: `Page '${page.name}' references component '${componentId}' which doesn't exist`,
              affected: [page.route],
              fixable: false,
            });
          }
        }
      }
    }

    // Check Auth consistency
    if (config.auth && config.api) {
      const apiRolesNeeded = new Set<string>();
      for (const endpoint of config.api.endpoints || []) {
        if (endpoint.requiredRoles) {
          endpoint.requiredRoles.forEach(r => apiRolesNeeded.add(r));
        }
      }

      const authRolesAvailable = new Set(config.auth.roles?.map(r => r.name) || []);
      for (const role of apiRolesNeeded) {
        if (!authRolesAvailable.has(role)) {
          issues.push({
            type: 'auth-mismatch',
            description: `API requires role '${role}' but it's not defined in auth schema`,
            affected: Array.from(apiRolesNeeded),
            fixable: true,
          });
        }
      }
    }
  } catch (error) {
    logger.error('Consistency check error', { error: String(error) });
  }

  return issues;
}

function canFixIssue(issue: z.ZodIssue): boolean {
  return (
    issue.code === 'invalid_type' ||
    issue.code === 'invalid_enum_value' ||
    issue.code === 'too_small'
  );
}

function getSuggestedFix(issue: z.ZodIssue, config: any): any {
  if (issue.code === 'invalid_type') {
    const path = issue.path.join('.');
    if (issue.expected === 'string') return '';
    if (issue.expected === 'array') return [];
    if (issue.expected === 'object') return {};
  }
  return null;
}

export async function repairConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  logger.info('Stage 4: Repair - Starting Auto-Repair');

  try {
    // First pass: fix obvious issues
    const repaired: any = { ...config };

    // Ensure required top-level fields
    if (!repaired.id) repaired.id = require('uuid').v4();
    if (!repaired.timestamp) repaired.timestamp = new Date();
    if (!repaired.version) repaired.version = '1.0.0';

    // Fix entity issues
    if (repaired.entities) {
      repaired.entities = repaired.entities.map((entity: any) => {
        if (!entity.fields) entity.fields = [];
        if (!entity.timestamps) entity.timestamps = true;

        // Ensure id field exists
        if (!entity.fields.find((f: any) => f.name === 'id')) {
          entity.fields.unshift({
            name: 'id',
            type: 'string',
            required: true,
          });
        }

        return entity;
      });
    }

    // Fix API endpoints
    if (repaired.api && repaired.api.endpoints) {
      repaired.api.endpoints = repaired.api.endpoints.map((ep: any) => ({
        ...ep,
        id: ep.id || require('uuid').v4(),
        method: ep.method?.toUpperCase() || 'GET',
        responseSchema: ep.responseSchema || { status: 200, data: {} },
      }));
    }

    // Validate repaired config
    const validated = await AppConfigSchema.parseAsync(repaired);
    logger.info('Stage 4: Repair - Auto-Repair Successful');
    return validated;
  } catch (error) {
    logger.error('Stage 4: Repair - Failed to repair config', { error: String(error) });
    throw new RepairError('validation', { originalError: String(error) });
  }
}

export async function validateAndRepair(config: Partial<AppConfig>): Promise<{
  config: AppConfig;
  issues: ValidationIssue[];
  consistencyIssues: ConsistencyIssue[];
  repaired: boolean;
}> {
  logger.info('Stage 4: Validation & Repair Pipeline');

  try {
    const validationIssues = await validateAppConfig(config);
    const consistencyIssues = await checkConsistency(config);
    const hasErrors = validationIssues.some(i => i.severity === 'error');

    if (hasErrors) {
      const repaired = await repairConfig(config);
      return {
        config: repaired,
        issues: validationIssues,
        consistencyIssues,
        repaired: true,
      };
    }

    const validated = await AppConfigSchema.parseAsync(config);
    return {
      config: validated,
      issues: validationIssues,
      consistencyIssues,
      repaired: false,
    };
  } catch (error) {
    logger.error('Stage 4: Validation & Repair - Fatal Error', { error: String(error) });
    throw error;
  }
}
