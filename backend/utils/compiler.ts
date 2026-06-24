import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger.ts';
import { extractIntent } from '../stages/01-intent-extraction.ts';
import { designSystem } from '../stages/02-system-design.ts';
import { generateSchemas } from '../stages/03-schema-generation.ts';
import { validateAndRepair } from '../stages/04-validation-repair.ts';
import { generateApp } from '../stages/05-code-generation.ts';
import { type AppConfig } from '../schemas/app-config.schema.ts';

interface CompilationMetrics {
  startTime: number;
  stages: Record<string, { duration: number; success: boolean }>;
  totalDuration: number;
}

export async function compilePrompt(prompt: string): Promise<{
  success: boolean;
  appId?: string;
  config?: AppConfig;
  generatedApp?: any;
  metrics: CompilationMetrics;
  error?: string;
}> {
  const startTime = Date.now();
  const metrics: CompilationMetrics = {
    startTime,
    stages: {},
    totalDuration: 0,
  };

  try {
    // Stage 1: Intent Extraction
    let stage1Start = Date.now();
    logger.info('Starting compilation pipeline');
    const intent = await extractIntent(prompt);
    metrics.stages['intent-extraction'] = {
      duration: Date.now() - stage1Start,
      success: true,
    };

    // Stage 2: System Design
    const stage2Start = Date.now();
    const design = await designSystem(intent);
    metrics.stages['system-design'] = {
      duration: Date.now() - stage2Start,
      success: true,
    };

    // Stage 3: Schema Generation
    const stage3Start = Date.now();
    const schemas = await generateSchemas(intent);
    metrics.stages['schema-generation'] = {
      duration: Date.now() - stage3Start,
      success: true,
    };

    // Stage 4: Validation & Repair
    const stage4Start = Date.now();
    const partialConfig: any = {
      id: uuidv4(),
      appName: intent.appName,
      description: intent.description,
      version: '1.0.0',
      entities: intent.entities,
      features: intent.features,
      ui: schemas.ui,
      api: schemas.api,
      database: schemas.database,
      auth: schemas.auth,
      businessLogic: {},
      timestamp: new Date(),
    };

    const validationResult = await validateAndRepair(partialConfig);
    metrics.stages['validation-repair'] = {
      duration: Date.now() - stage4Start,
      success: true,
    };

    if (!validationResult.config) {
      throw new Error('Validation returned no config');
    }

    // Stage 5: Code Generation
    const stage5Start = Date.now();
    const generatedApp = await generateApp(validationResult.config);
    metrics.stages['code-generation'] = {
      duration: Date.now() - stage5Start,
      success: true,
    };

    metrics.totalDuration = Date.now() - startTime;

    logger.info('Compilation pipeline - SUCCESS', {
      appId: generatedApp.id,
      totalTime: metrics.totalDuration,
    });

    return {
      success: true,
      appId: generatedApp.id,
      config: validationResult.config,
      generatedApp,
      metrics,
    };
  } catch (error) {
    metrics.totalDuration = Date.now() - startTime;
    logger.error('Compilation pipeline - FAILED', { error: String(error) });

    return {
      success: false,
      metrics,
      error: String(error),
    };
  }
}
