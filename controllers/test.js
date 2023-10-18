const cron = require('node-cron');
const fetch = require('node-fetch');
const serviceAccount = require("../public/jsons/google-services.json");
const admin = require("firebase-admin");

// const cronSchedule = '0 0 0 */10 * *';
const cronSchedule = '* * * * *';


const sendGetRequest = async () => {
  try {
    // const response = await fetch(apiUrl);
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
        token: "fgtPt3pgQNSxGf0dUUsv88:APA91bENNf2SSU-Xublx_uQnkWncKxXEw0pcwVLpz4eRnIr9MLfIF0DxiFxrBDxmX7hMkJzeIeXwQ1BMmG12mZVYuLap5K59JNAJgIyXvN82tt0E1MbP1cprA8DWYYDZnYrV-n3vUjp2",
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

