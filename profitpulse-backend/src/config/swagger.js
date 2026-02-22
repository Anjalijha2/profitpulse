import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ProfitPulse API Docs',
            version: '1.0.0',
            description: 'API documentation for ProfitPulse - Profitability Intelligence System',
            contact: {
                name: 'API Support',
                email: 'support@profitpulse.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}${process.env.API_PREFIX || '/api/v1'}`,
                description: 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
