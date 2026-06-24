import { compilePrompt } from '../backend/utils/compiler.ts';
import { loadTestCases, saveResults, type TestCase } from './test-cases.ts';
import { logger } from '../backend/utils/logger.ts';

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

async function runEvaluation(): Promise<void> {
  logger.info('Starting evaluation run...');
  const testCases = loadTestCases();
  const results: EvaluationResult[] = [];

  for (const testCase of testCases) {
    logger.info(`Running test: ${testCase.name}`, { prompt: testCase.prompt });

    const startTime = Date.now();
    try {
      const result = await compilePrompt(testCase.prompt);
      const latency = Date.now() - startTime;

      results.push({
        testCaseId: testCase.id,
        name: testCase.name,
        success: result.success,
        metrics: {
          latency,
          repairsNeeded: 0, // Would be tracked from result
          consistencyIssues: 0, // Would be tracked from result
        },
        error: result.error,
      });

      logger.info(`Test completed: ${testCase.name}`, {
        success: result.success,
        latency,
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      results.push({
        testCaseId: testCase.id,
        name: testCase.name,
        success: false,
        metrics: {
          latency,
          repairsNeeded: 0,
          consistencyIssues: 0,
        },
        error: String(error),
      });

      logger.error(`Test failed: ${testCase.name}`, { error: String(error) });
    }
  }

  // Save results
  saveResults(results);

  // Print summary
  const successCount = results.filter(r => r.success).length;
  const successRate = (successCount / results.length) * 100;
  const avgLatency = results.reduce((sum, r) => sum + r.metrics.latency, 0) / results.length;

  logger.info('\n\n=== EVALUATION SUMMARY ===', {
    totalTests: results.length,
    successCount,
    failureCount: results.length - successCount,
    successRate: `${successRate.toFixed(2)}%`,
    avgLatency: `${avgLatency.toFixed(0)}ms`,
  });

  logger.info('\n=== RESULTS BY CATEGORY ===');
  const realProducts = results.filter(r => r.name);
  const realProductsSuccess = realProducts.filter(r => r.success).length;
  logger.info('Real Products', {
    total: realProducts.length,
    success: realProductsSuccess,
    rate: `${((realProductsSuccess / realProducts.length) * 100).toFixed(2)}%`,
  });
}

runEvaluation().catch(error => {
  logger.error('Evaluation failed', { error: String(error) });
  process.exit(1);
});
