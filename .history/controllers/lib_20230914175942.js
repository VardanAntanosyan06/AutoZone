const fetch = require("node-fetch");

const sendSMSCode = async (phoneNumber, subject, text) => {
    //working API
    await fetch('https://api.mobipace.com:444/v3/Authorize', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Username: process.env.MPC_USER,
            Password: process.env.MPC_USER_PASSWORD,
        }),
    })
        .then(res => res.json())
        .then(responseJson => {
            console.log(responseJson);
            let sessionId = responseJson.SessionId;

            fetch('https://api.mobipace.com:444/v3/Send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    SessionId: sessionId,
                    Sender: 'AutoZone',

                    Messages: [
                        {
                            Recipient: phoneNumber,
                            Body: text,
                        },
                    ],
                }),
            });
        });
};
