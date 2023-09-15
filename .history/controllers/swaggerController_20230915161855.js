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
 *         description: Maximum daily message limit exceeded.
 */

  /**
 * @swagger
 * paths:
 *   /api/v1/users/verification:
 *     get:
 *       summary: Verify Phone Number with Verification Code
 *       description: Verify a phone number with a verification code.
 *       tags:
 *         - Verification
 *       parameters:
 *         - in: query
 *           name: phoneNumber
 *           required: true
 *           schema:
 *             type: string
 *           example: "37499999999"
 *           description: The phone number to be verified.
 *         - in: query
 *           name: verificationCode
 *           required: true
 *           schema:
 *             type: string
 *           example: "123456"
 *           description: The verification code to be used.
 *       responses:
 *         200:
 *           description: Successful verification
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Phone number successfully verified."
 *         403:
 *           description: Wrong verificationCode or phoneNumber
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: false
 *                   error:
 *                     type: string
 *                     example: "Wrong verificationCode or phoneNumber!"
 */

// Schemas


const swaggerSpec = swaggerJSDOC(options);
module.exports = {
  swaggerSpec,
};
