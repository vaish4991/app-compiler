import { z } from 'zod';

export const UIComponentSchema = z.object({
  id: z.string(),
  type: z.enum(['form', 'table', 'chart', 'list', 'detail', 'hero', 'nav', 'card', 'button', 'input', 'select', 'textarea', 'modal']),
  label: z.string().optional(),
  entity: z.string().optional(),
  fields: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'email', 'password', 'number', 'date', 'select', 'textarea', 'checkbox', 'radio']),
    required: z.boolean().default(false),
    validation: z.record(z.any()).optional(),
    options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  })).optional(),
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.string(),
    sortable: z.boolean().optional(),
    filterable: z.boolean().optional(),
  })).optional(),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['button', 'link', 'modal']),
    action: z.string(),
  })).optional(),
});

export type UIComponent = z.infer<typeof UIComponentSchema>;

export const UIPageSchema = z.object({
  name: z.string(),
  route: z.string(),
  title: z.string(),
  description: z.string().optional(),
  layout: z.enum(['single', 'two-column', 'three-column', 'dashboard', 'form']),
  components: z.array(z.string()), // Component IDs
  authRequired: z.boolean().default(false),
  requiredRoles: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type UIPage = z.infer<typeof UIPageSchema>;

export const UISchemaOutput = z.object({
  pages: z.array(UIPageSchema),
  components: z.map(z.string(), UIComponentSchema),
  globalStyles: z.record(z.any()).optional(),
  theme: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
  }).optional(),
});

export type UISchema = z.infer<typeof UISchemaOutput>;
