import { z } from 'zod';

// 1. Architecture Extraction Schema
export const architectureExtractionSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      type: z.enum(['frontend', 'backend', 'database', 'queue', 'external', 'service']).default('service'),
    })
  ),
  edges: z.array(
    z.object({
      source: z.string().min(1),
      target: z.string().min(1),
      label: z.string().optional(),
    })
  ),
});

// 2. Database/ER Schema
export const erExtractionSchema = z.object({
  tables: z.array(
    z.object({
      name: z.string().min(1),
      columns: z.array(
        z.object({
          name: z.string().min(1),
          type: z.string().min(1),
          isPrimaryKey: z.boolean().default(false),
          isForeignKey: z.boolean().default(false),
        })
      ),
    })
  ),
  relationships: z.array(
    z.object({
      fromTable: z.string().min(1),
      fromCol: z.string().min(1),
      toTable: z.string().min(1),
      toCol: z.string().min(1),
    })
  ).optional().default([]),
});

// 3. Flowchart Schema
export const flowExtractionSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      type: z.enum(['process', 'decision', 'terminal']).default('process'),
    })
  ),
  edges: z.array(
    z.object({
      source: z.string().min(1),
      target: z.string().min(1),
      label: z.string().optional(),
    })
  ),
});

// 4. UML Class/Object Schema
export const umlExtractionSchema = z.object({
  classes: z.array(
    z.object({
      name: z.string().min(1),
      attributes: z.array(z.string()).default([]),
      methods: z.array(z.string()).default([]),
    })
  ),
  associations: z.array(
    z.object({
      source: z.string().min(1),
      target: z.string().min(1),
      type: z.enum(['inheritance', 'realization', 'association', 'aggregation', 'composition']).default('association'),
    })
  ).default([]),
});

// 5. Cloud Resources Schema
export const cloudExtractionSchema = z.object({
  resources: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      type: z.string().min(1),
      provider: z.enum(['aws', 'gcp', 'azure', 'generic']).default('generic'),
    })
  ),
  connections: z.array(
    z.object({
      source: z.string().min(1),
      target: z.string().min(1),
      protocol: z.string().optional(),
    })
  ).default([]),
});

// 6. API Route Schema
export const apiExtractionSchema = z.object({
  endpoints: z.array(
    z.object({
      path: z.string().min(1),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']).default('GET'),
      summary: z.string().optional(),
      responses: z.array(
        z.object({
          statusCode: z.number(),
          description: z.string().optional(),
        })
      ).default([]),
    })
  ),
  dependencies: z.array(
    z.object({
      endpointPath: z.string().min(1),
      callsService: z.string().min(1),
    })
  ).default([]),
});

// Registry matching schemas to category tags
export const SCHEMAS_BY_CATEGORY: Record<string, z.ZodSchema<any>> = {
  architecture: architectureExtractionSchema,
  database: erExtractionSchema,
  er: erExtractionSchema,
  flow: flowExtractionSchema,
  uml: umlExtractionSchema,
  cloud: cloudExtractionSchema,
  api: apiExtractionSchema,
};
