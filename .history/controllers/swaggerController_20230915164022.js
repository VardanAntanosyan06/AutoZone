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
 *     summary: Registration User
 *     description: Register a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "37499999999"
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Maximum daily message limit exceeded.
 *       400:
 *         description: Bad request - Invalid input data.
 */


/**
 * @swagger
 * paths:
 *   /api/v1/users/verification:
 *     get:
 *       summary: Verify Phone Number with Verification Code
 *       description: Verify a phone number with a verification code.
 *       tags:
 *         - Users
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

/**
 * @swagger
 * /api/v1/users/createOrUpdatePin:
 *   patch:
 *     summary: Update User Phone Number or PIN
 *     description: Update a user's phone number or PIN.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "37499755073"
 *               pin:
 *                 type: string
 *                 example: "10000"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "jwt_token"
 *       403:
 *         description: Phone number or PIN cannot be empty or Wrong phoneNumber
 /**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Registration User
 *     description: Register a new user.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "37499999999"
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Maximum daily message limit exceeded.
 *       400:
 *         description: Bad request - Invalid input data.
 *
 *   patch:
 *     summary: Update User Phone Number or PIN
 *     description: Update a user's phone number or PIN.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "37499755073"
 *               pin:
 *                 type: string
 *                 example: "10000"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "your_jwt_token_here"
 *       403:
 *         description: Phone number or PIN cannot be empty or Wrong phoneNumber!
 *
 * /api/v1/users/login:
 *   get:
 *     summary: User Login
 *     description: Log in using phone number and PIN or user token.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: phoneNumber
 *         required: false
 *         schema:
 *           type: string
 *         example: "37499999999"
 *         description: The user's phone number.
 *       - in: query
 *         name: pin
 *         required: false
 *         schema:
 *           type: string
 *         example: "10000"
 *         description: The user's PIN code.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   example: ""
 *       403:
 *         description: Token timeout - please enter the PIN code
 *     security:
 *       - bearerAuth: []
 */



const swaggerSpec = swaggerJSDOC(options);
module.exports = {
  swaggerSpec,
};
