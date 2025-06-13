const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NutriMate API Docs',
      version: '1.0.0',
      description: 'API documentation for NutriMate project',
    },
    servers: [
      {
        url: 'http://localhost:4000/api/v1',
        description: 'Local dev server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // JSDoc 문서 위치
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
