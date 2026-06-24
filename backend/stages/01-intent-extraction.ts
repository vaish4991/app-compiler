import { z } from 'zod';
import { OpenAI } from 'openai';
import { logger } from '../utils/logger.ts';
import { IntentOutputSchema, type IntentOutput } from '../schemas/app-config.schema.ts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const INTENT_EXTRACTION_PROMPT = `You are an expert software architect. Analyze the user's natural language requirement and extract structured intent.

RETURN ONLY valid JSON (no markdown, no explanations). The JSON must match this schema:

{
  "appName": "string (short, memorable name)",
  "description": "string (2-3 sentence description)",
  "entities": [
    {
      "name": "string (singular, e.g., 'User')",
      "type": "user|admin|customer|product|order|payment|subscription|custom",
      "fields": [
        {
          "name": "string",
          "type": "string|number|boolean|date|email|password|json|enum",
          "required": boolean,
          "validation": { optional object with validation rules },
          "enumValues": [ optional array of values ]
        }
      ],
      "relationships": [
        {
          "targetEntity": "string",
          "type": "one-to-one|one-to-many|many-to-many",
          "foreignKey": "optional string"
        }
      ],
      "timestamps": true
    }
  ],
  "features": [
    {
      "name": "string",
      "description": "string",
      "entities": [ "entity names involved" ],
      "authRequired": boolean,
      "premiumOnly": boolean
    }
  ],
  "authModel": "none|basic|oauth|rbac",
  "monetization": "free|freemium|subscription|one-time",
  "adminDashboard": boolean,
  "analytics": boolean
}

Rules:
1. Extract ONLY what's explicitly mentioned or strongly implied
2. For auth, choose 'rbac' if roles mentioned (admin, user, etc), 'basic' if login mentioned, 'none' if not applicable
3. For monetization, choose 'freemium' if premium/paid features mentioned
4. Identify ALL entities and their relationships
5. Each entity must have at least an 'id' and 'createdAt' field
6. Be conservative: if unsure, omit rather than invent fields

User Requirement:
{prompt}

RETURN ONLY THE JSON, NO OTHER TEXT.`;

export async function extractIntent(prompt: string): Promise<IntentOutput> {
  logger.info('Stage 1: Intent Extraction', { promptLength: prompt.length });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'user',
          content: INTENT_EXTRACTION_PROMPT.replace('{prompt}', prompt),
        },
      ],
      temperature: 0.3, // Lower temperature for consistency
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr);
    const validated = IntentOutputSchema.parse(parsed);

    logger.info('Stage 1: Intent Extraction - Success', {
      appName: validated.appName,
      entityCount: validated.entities.length,
      featureCount: validated.features.length,
    });

    return validated;
  } catch (error) {
    logger.error('Stage 1: Intent Extraction - Error', { error: String(error) });
    throw error;
  }
}
