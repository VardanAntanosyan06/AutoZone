const cron = require('node-cron');
const fetch = require('node-fetch');
const serviceAccount = require("../public/jsons/google-services.json");
const admin = require("firebase-admin");

const cronSchedule = '0 0 0 */10 * *';

const sendGetRequest = async () => {
  try {
    const response = await fetch(apiUrl);
    // if (response.ok) {
    //   console.log(`GET request sent to ${apiUrl} on ${new Date().toLocaleString()}`);
    //   console.log(`Response status code: ${response.status}`);
    // } else {
    //   console.error(`Error sending GET request. Response status code: ${response.status}`);
    // }
    if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
      const message = {
        notification: {
          title:"test",
          body:"test",
        },
        token: receiver.deviceToken,
      };

      await admin.messaging().send(message);
  } catch (error) {
    console.error('Error sending GET request:', error);
  }
};

// Create a cron job to execute the function
cron.schedule(cronSchedule, () => {
  sendGetRequest();
});
