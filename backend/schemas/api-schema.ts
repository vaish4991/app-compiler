import { z } from 'zod';

export const APIEndpointSchema = z.object({
  id: z.string(),
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  name: z.string(),
  description: z.string().optional(),
  entity: z.string(),
  action: z.enum(['list', 'get', 'create', 'update', 'delete', 'custom']),
  
  // Request
  requestSchema: z.object({
    query: z.record(z.any()).optional(),
    body: z.record(z.any()).optional(),
    params: z.record(z.any()).optional(),
  }).optional(),
  
  // Response
  responseSchema: z.object({
    status: z.number(),
    data: z.record(z.any()),
  }),
  
  // Authorization
  requiredRoles: z.array(z.string()).optional(),
  authRequired: z.boolean().default(false),
  
  // Business logic
  premiumOnly: z.boolean().default(false),
  rateLimited: z.boolean().default(false),
  cacheEnabled: z.boolean().default(false),
});

export type APIEndpoint = z.infer<typeof APIEndpointSchema>;

export const APISchemaOutput = z.object({
  baseUrl: z.string(),
  version: z.string(),
  endpoints: z.array(APIEndpointSchema),
  errorResponses: z.array(z.object({
    status: z.number(),
    code: z.string(),
    message: z.string(),
  })).optional(),
  authentication: z.object({
    type: z.enum(['jwt', 'session', 'oauth']),
    headerName: z.string().optional(),
  }).optional(),
});

export type APISchema = z.infer<typeof APISchemaOutput>;
