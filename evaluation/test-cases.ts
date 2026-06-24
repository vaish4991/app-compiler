import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.ts';

interface TestCase {
  id: string;
  name: string;
  category: 'real-product' | 'edge-case';
  prompt: string;
  expectedFeatures: string[];
  shouldSucceed: boolean;
}

interface EvaluationResult {
  testCaseId: string;
  name: string;
  success: boolean;
  metrics: {
    latency: number;
    repairsNeeded: number;
    consistencyIssues: number;
  };
  error?: string;
}

export const TEST_CASES: TestCase[] = [
  // Real Products (10)
  {
    id: uuidv4(),
    name: 'CRM System',
    category: 'real-product',
    prompt:
      'Build a CRM with login, contacts management, sales dashboard, role-based access (admin/sales/viewer), and premium plan with payments. Admins can see analytics.',
    expectedFeatures: ['auth', 'contacts', 'dashboard', 'rbac', 'payments', 'analytics'],
    shouldSucceed: true,
  },
  {
    id: uuidv4(),
    name: 'E-commerce Platform',
    category: 'real-product',
    prompt:
      'Create an e-commerce site with product catalog, shopping cart, user accounts, order history, payment processing, inventory management, and admin panel.',
    expectedFeatures: ['products', 'cart', 'orders', 'payments', 'inventory', 'admin'],
    shouldSucceed: true,
  },
  {
    id: uuidv4(),
    name: 'Project Management Tool',
    category: 'real-product',
    prompt:
      'Build a project management app with tasks, teams, deadlines, notifications, file uploads, comments, and permission levels.',
    expectedFeatures: ['tasks', 'teams', 'notifications', 'files', 'permissions'],
    shouldSucceed: true,
  },
  {
    id: uuidv4(),
    name: 'Booking System',
    category: 'real-product',
    prompt:
      'Create a booking platform for salons/services with calendar, appointments, customer profiles, payments, reminders, and availability management.',
    expectedFeatures: ['calendar', 'appointments', 'payments', 'notifications', 'availability'],
    shouldSucceed: true,
  },
  {
    id: uuidv4(),
    name: 'Blog Platform',
    category: 'real-product',
    prompt:
      'Build a multi-author blog platform with posts, comments, user profiles, categories, search, SEO optimization, and admin moderation.',
    expectedFeatures: ['posts', 'comments', 'users', 'categories', 'search', 'admin'],
    shouldSucceed: true,
  },
  {
    id: uuidv4(),
    name: 'LMS',
    category: 'real-product',
    prompt:
      'Create a learning management system with courses, lessons, quizzes, student progress tracking, certificates, instructors, and payments.',
    expectedFeatures: ['courses', 'lessons', 'quizzes', 'progress', 'certificates', 'payments'],
    shouldSucceed: true,
  },
  {
    id: uuidv4(),
    name: 'Social Network',
    category: 'real-product',
    prompt:
      'Build a social platform with user profiles, posts, comments, likes, follow/unfollow, messaging, notifications, and feed.',
    expectedFeatures: ['profiles', 'posts', 'messages', 'notifications', 'feed'],
    shouldSucceed: true,
  },
  {
    id: uuidv4(),
    name: 'Analytics Dashboard',
    category: 'real-product',
    prompt:
      'Create a real-time analytics dashboard with data visualization, multiple data sources, custom reports, user authentication, and export features.',
    expectedFeatures: ['visualization', 'reports', 'auth', 'export'],
    shouldSucceed: true,
  },
  {
    id: uuidv4(),
    name: 'SaaS App',
    category: 'real-product',
    prompt:
      'Build a SaaS platform with user management, subscription plans, billing, API access, documentation, and team collaboration features.',
    expectedFeatures: ['users', 'billing', 'api', 'teams'],
    shouldSucceed: true,
  },
  {
    id: uuidv4(),
    name: 'Marketplace',
    category: 'real-product',
    prompt:
      'Create a marketplace with sellers, products, shopping, payments, reviews, ratings, seller dashboard, and dispute resolution.',
    expectedFeatures: ['sellers', 'products', 'payments', 'reviews', 'dashboard'],
    shouldSucceed: true,
  },

  // Edge Cases (10)
  {
    id: uuidv4(),
    name: 'Vague Requirements',
    category: 'edge-case',
    prompt: 'Build an app',
    expectedFeatures: [],
    shouldSucceed: false,
  },
  {
    id: uuidv4(),
    name: 'Conflicting Requirements',
    category: 'edge-case',
    prompt:
      'Build a mobile-only app that works in desktop browsers. No database but needs data persistence. Free with premium features.',
    expectedFeatures: [],
    shouldSucceed: false,
  },
  {
    id: uuidv4(),
    name: 'Incomplete Specification',
    category: 'edge-case',
    prompt: 'Create a system with users and... something else.',
    expectedFeatures: [],
    shouldSucceed: false,
  },
  {
    id: uuidv4(),
    name: 'Complex Requirements',
    category: 'edge-case',
    prompt:
      'Build an enterprise ERP system with supply chain, HR module, accounting, manufacturing, multi-language, multi-currency, compliance reports.',
    expectedFeatures: ['supply-chain', 'hr', 'accounting'],
    shouldSucceed: true,
  },
  {
    id: uuidv4(),
    name: 'Contradictory Auth',
    category: 'edge-case',
    prompt:
      'Create an app with no authentication but requires login. All users are admins but have different permissions.',
    expectedFeatures: [],
    shouldSucceed: false,
  },
  {
    id: uuidv4(),
    name: 'Minimal Requirements',
    category: 'edge-case',
    prompt: 'Create a to-do app.',
    expectedFeatures: ['todos'],
    shouldSucceed: true,
  },
  {
    id: uuidv4(),
    name: 'Unclear Entities',
    category: 'edge-case',
    prompt: 'Build something with things that have properties and do actions.',
    expectedFeatures: [],
    shouldSucceed: false,
  },
  {
    id: uuidv4(),
    name: 'Impossible Requirements',
    category: 'edge-case',
    prompt: 'Build an app that works offline and in real-time across all users simultaneously.',
    expectedFeatures: [],
    shouldSucceed: false,
  },
  {
    id: uuidv4(),
    name: 'Extreme Scale',
    category: 'edge-case',
    prompt:
      'Create a system to handle 1 billion concurrent users, sub-millisecond latency, infinite storage, no infrastructure costs.',
    expectedFeatures: [],
    shouldSucceed: false,
  },
  {
    id: uuidv4(),
    name: 'Very Long Requirement',
    category: 'edge-case',
    prompt:
      'Build a comprehensive management system that integrates customer relationships, tracks inventory across multiple warehouses, manages finances including invoicing and accounting, handles employee management with time tracking, provides real-time analytics with customizable dashboards, supports multiple user roles with granular permissions, includes communication tools for team collaboration, maintains audit logs for compliance, offers mobile access, includes API for third-party integrations, and must be scalable, secure, and maintainable.',
    expectedFeatures: ['crm', 'inventory', 'finance', 'hr', 'analytics', 'api'],
    shouldSucceed: true,
  },
];

export function loadTestCases(): TestCase[] {
  const testCasesPath = path.join(process.cwd(), 'evaluation/test-cases.json');
  if (fs.existsSync(testCasesPath)) {
    try {
      const data = fs.readFileSync(testCasesPath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      logger.warn('Failed to load test cases from file, using defaults');
    }
  }
  return TEST_CASES;
}

export function saveTestCases(testCases: TestCase[]): void {
  const testCasesPath = path.join(process.cwd(), 'evaluation/test-cases.json');
  fs.writeFileSync(testCasesPath, JSON.stringify(testCases, null, 2));
}

export function saveResults(results: EvaluationResult[]): void {
  const resultsPath = path.join(process.cwd(), 'evaluation/results.json');
  const summary = {
    timestamp: new Date(),
    totalTests: results.length,
    successCount: results.filter(r => r.success).length,
    failureCount: results.filter(r => !r.success).length,
    successRate: (results.filter(r => r.success).length / results.length) * 100,
    averageLatency: results.reduce((sum, r) => sum + r.metrics.latency, 0) / results.length,
    averageRepairs: results.reduce((sum, r) => sum + r.metrics.repairsNeeded, 0) / results.length,
    results,
  };

  fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2));
  logger.info('Evaluation results saved', { path: resultsPath });
}
