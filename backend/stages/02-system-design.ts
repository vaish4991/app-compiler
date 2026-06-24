import { logger } from '../utils/logger.ts';
import { type IntentOutput, type Entity } from '../schemas/app-config.schema.ts';

interface SystemDesign {
  appName: string;
  entities: Entity[];
  pages: string[];
  mainFlows: string[];
  roles: string[];
  features: string[];
}

const DESIGN_RULES = {
  // For each entity, what pages should exist
  entityPages: {
    'user': ['login', 'profile', 'settings'],
    'admin': ['admin-dashboard', 'user-management'],
    'product': ['product-list', 'product-detail'],
    'order': ['order-list', 'order-detail', 'order-create'],
    'payment': [], // Usually not directly viewed by users
    'subscription': ['subscription-management'],
  } as Record<string, string[]>,

  // Default roles based on auth model
  rolesByAuthModel: {
    'none': [],
    'basic': ['user'],
    'oauth': ['user'],
    'rbac': ['admin', 'user'],
  } as Record<string, string[]>,

  // Main user flows
  flowsByFeatures: {
    'authentication': ['signup', 'login', 'password-reset'],
    'user-management': ['create-user', 'edit-user', 'delete-user', 'list-users'],
    'analytics': ['view-analytics', 'export-data'],
  } as Record<string, string[]>,
};

export async function designSystem(intent: IntentOutput): Promise<SystemDesign> {
  logger.info('Stage 2: System Design', { appName: intent.appName });

  try {
    // Determine pages based on entities and features
    const pages = new Set<string>();
    pages.add('home');
    if (intent.authModel !== 'none') pages.add('login');
    if (intent.adminDashboard) pages.add('admin');

    // Add pages for each entity
    for (const entity of intent.entities) {
      const entityPages = DESIGN_RULES.entityPages[entity.type] || [];
      entityPages.forEach(p => pages.add(`${entity.name.toLowerCase()}-${p}`));
    }

    // Add feature-specific pages
    for (const feature of intent.features) {
      if (feature.name.toLowerCase().includes('analytics')) pages.add('analytics');
      if (feature.name.toLowerCase().includes('dashboard')) pages.add('dashboard');
    }

    // Determine roles
    let roles = DESIGN_RULES.rolesByAuthModel[intent.authModel] || [];
    if (intent.adminDashboard && !roles.includes('admin')) {
      roles = ['admin', 'user'];
    }

    // Determine main flows
    const flows = new Set<string>();
    if (intent.authModel !== 'none') {
      flows.add('authentication');
    }
    intent.features.forEach(f => {
      if (f.name.toLowerCase().includes('user-management')) flows.add('user-management');
      if (f.name.toLowerCase().includes('analytics')) flows.add('analytics');
    });

    const design: SystemDesign = {
      appName: intent.appName,
      entities: intent.entities,
      pages: Array.from(pages),
      mainFlows: Array.from(flows),
      roles,
      features: intent.features.map(f => f.name),
    };

    logger.info('Stage 2: System Design - Success', {
      pageCount: design.pages.length,
      roleCount: design.roles.length,
      flowCount: design.mainFlows.length,
    });

    return design;
  } catch (error) {
    logger.error('Stage 2: System Design - Error', { error: String(error) });
    throw error;
  }
}
