const swaggerJSDOC = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auto Zone",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000/",
      },
    ],
  },
  apis: ["controllers/swaggerController.js"],
};


/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Registartion User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: success true
 *       403:
 *         description: Some Validation error.
 */




// Schemas
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - phoneNumber
 *       properties:
 *         phoneNumber:
 *           type: string
 *           example:37499999999 
 */

const swaggerSpec = swaggerJSDOC(options);
module.exports = {
  swaggerSpec,
};
