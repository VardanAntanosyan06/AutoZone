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
  apis: ["controlers/swaggeracontroller.js"],
};



const swaggerSpec = swaggerJSDOC(options);
module.exports = {
  swaggerSpec,
};
