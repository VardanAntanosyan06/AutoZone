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
 *           example:374 
 *         lastName:
 *           type: string
 *           example: user's lastname
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         phoneNumber:
 *           type: string
 *           example: +37499999999
 *         birthday:
 *           type: string
 *           format: date-time
 *           example: 2023-08-14T11:51:33.897Z
 *         gender:
 *           type: string
 *           example: Male
 *         country:
 *           type: string
 *           example: Armenia
 *         city:
 *           type: string
 *           example: Yerevan
 *         englishLevel:
 *           type: string
 *           example: B1
 *         education:
 *           type: string
 *           example: some info
 *         backgroundInQA:
 *           type: boolean
 *           example: false
 *         password:
 *           type: string
 *           example: test1234
 *         role:
 *           type: string
 *           example: Student
 */

const swaggerSpec = swaggerJSDOC(options);
module.exports = {
  swaggerSpec,
};
