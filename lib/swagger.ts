import { createSwaggerSpec } from 'next-swagger-doc';

const apiDirectory = './app/api';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    definition: {
      openapi: '3.1.0',
      info: {
        title: 'FastFood API',
        version: '1.0.0',
        description: 'API documentation for FastFood food ordering platform',
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          CSRFToken: {
            type: 'apiKey',
            in: 'header',
            name: 'x-csrf-token',
            description: 'CSRF token for state-changing operations',
          },
        },
        schemas: {
          ApiResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: 'Whether the request was successful',
              },
              data: {
                type: 'object',
                description: 'Response data (when success is true)',
              },
              error: {
                type: 'object',
                properties: {
                  code: {
                    type: 'string',
                    description: 'Error code',
                  },
                  message: {
                    type: 'string',
                    description: 'Human-readable error message',
                  },
                  details: {
                    type: 'object',
                    description: 'Additional error details',
                  },
                },
                description: 'Error information (when success is false)',
              },
              meta: {
                type: 'object',
                properties: {
                  timestamp: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Response timestamp',
                  },
                  requestId: {
                    type: 'string',
                    description: 'Unique request identifier',
                  },
                },
                description: 'Metadata about the response',
              },
            },
            required: ['success'],
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              roles: {
                type: 'array',
                items: { $ref: '#/components/schemas/Role' },
              },
            },
          },
          Role: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          Product: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
              ingredients: {
                type: 'array',
                items: { $ref: '#/components/schemas/Ingredient' },
              },
            },
          },
          Ingredient: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
    apiFolder: apiDirectory,
  });

  return spec;
};
