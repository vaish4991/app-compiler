import { z } from 'zod';

export const ColumnSchema = z.object({
  name: z.string(),
  type: z.enum(['serial', 'bigserial', 'integer', 'bigint', 'varchar', 'text', 'boolean', 'date', 'timestamp', 'json', 'uuid', 'decimal']),
  nullable: z.boolean().default(true),
  primaryKey: z.boolean().default(false),
  unique: z.boolean().default(false),
  default: z.any().optional(),
  references: z.object({
    table: z.string(),
    column: z.string(),
  }).optional(),
});

export type Column = z.infer<typeof ColumnSchema>;

export const TableSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  entity: z.string(),
  columns: z.array(ColumnSchema),
  indexes: z.array(z.object({
    name: z.string(),
    columns: z.array(z.string()),
    unique: z.boolean().default(false),
  })).optional(),
  timestamps: z.boolean().default(true),
});

export type Table = z.infer<typeof TableSchema>;

export const DBSchemaOutput = z.object({
  type: z.literal('postgresql'),
  version: z.string().default('14'),
  tables: z.array(TableSchema),
  migrations: z.array(z.object({
    version: z.string(),
    name: z.string(),
    up: z.string(),
    down: z.string(),
  })).optional(),
});

export type DBSchema = z.infer<typeof DBSchemaOutput>;
