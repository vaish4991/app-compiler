import { z } from 'zod';

export const RoleSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  hierarchy: z.number().optional(), // For role inheritance
});

export type Role = z.infer<typeof RoleSchema>;

export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  resource: z.string(),
  action: z.enum(['read', 'create', 'update', 'delete', 'admin']),
});

export type Permission = z.infer<typeof PermissionSchema>;

export const AuthSchemaOutput = z.object({
  type: z.enum(['jwt', 'session', 'oauth']),
  
  // JWT specific
  jwt: z.object({
    algorithm: z.string().default('HS256'),
    expiresIn: z.string().default('7d'),
    refreshTokenExpiry: z.string().default('30d'),
    secret: z.string().optional(), // Will be generated
  }).optional(),
  
  // Roles and permissions
  roles: z.array(RoleSchema),
  permissions: z.array(PermissionSchema),
  defaultRole: z.string(),
  
  // OAuth (if applicable)
  oauth: z.object({
    providers: z.array(z.enum(['google', 'github', 'facebook'])),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
  }).optional(),
  
  // Access control lists
  acl: z.array(z.object({
    resource: z.string(),
    role: z.string(),
    permission: z.string(),
  })).optional(),
});

export type AuthSchema = z.infer<typeof AuthSchemaOutput>;
