export class ValidationError extends Error {
  constructor(public issues: Array<{ path: string; message: string }>) {
    super(`Validation failed: ${issues.map(i => `${i.path}: ${i.message}`).join(', ')}`);
    this.name = 'ValidationError';
  }
}

export class RepairError extends Error {
  constructor(public stage: string, public details: any) {
    super(`Repair failed at stage ${stage}`);
    this.name = 'RepairError';
  }
}

export class CompilationError extends Error {
  constructor(public stage: string, message: string) {
    super(`Compilation error at stage ${stage}: ${message}`);
    this.name = 'CompilationError';
  }
}
