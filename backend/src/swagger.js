import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API for event management',
            description: "API endpoints for an event manager documented on swagger",
            version: '1.0.0',
        },
        servers: [
            {
                url: "http://localhost:3000/",
                description: "Local server"
            },
        ]
    },
    // looks for configuration in specified directories.
    // path from the directory where 'package.json' resides
    apis: ['src/controller/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

export { swaggerSpec }
