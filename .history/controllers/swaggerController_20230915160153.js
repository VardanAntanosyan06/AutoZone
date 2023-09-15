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


/**
 * @swagger
 * components:
 *   schemas:
 *     Login:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: test1234
 */


/**
 * @swagger
 * /api/v2/user/login:
 *   post:
 *     summary: Login User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: success true
 *       403:
 *         description: Invaunvlid email or password!.
 */

/**
 * @swagger
 * /api/v2/user/ForgotPassword:
 *   get:
 *     summary: send mail for reset password
 *     parameters:
 *      - name: email
 *        in: query
 *        description: email of user
 *        required: true
 *        schema:
 *          type: string
 *          example: user@example.com
 *     responses:
 *       200:
 *         description: success:true
 *       404:
 *         description: There is not verified user!
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetPassword:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *           format: email
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV...
 *         newPassword:
 *           type: string
 *           example: test1234
 */

/**
 * @swagger
 * /api/v2/user/ChangePassword:
 *   patch:
 *     summary: Reset Password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: success:true
 *       403:
 *         description: token timeout!
 *       404:
 *         description: User not Found!
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetEmail:
 *       type: object
 *       required:
 *         - email
 *         - newEmail
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: test@example.com
 *         newEmail:
 *           type: string
 *           example: newEmail@example.com
 */

/**
 * @swagger
 * /api/v2/user/ChangeEmail:
 *   patch:
 *     summary: Reset Email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetEmail'
 *     responses:
 *       200:
 *         description: success:true
 *       403:
 *         description: Invalid Email format
 *       404:
 *         description: User not found!
*/


const swaggerSpec = swaggerJSDOC(options);
module.exports = {
  swaggerSpec,
};
