import swaggerJsdoc, { Options } from 'swagger-jsdoc';

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Routes for registration and login (public)
 *   - name: Public
 *     description: Publicly accessible event routes
 *   - name: Private
 *     description: Routes that require JWT authentication
 */

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API for event management',
      description: 'API endpoints for an event manager documented on swagger',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000/',
        description: 'Local server',
      },
    ],
  },
  // Path to the API docs
  // Note: update these paths to match your TypeScript source files
  apis: [
    'src/controller/*.ts',
    'src/database/model/*.ts',
    'src/config/swagger.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec };
