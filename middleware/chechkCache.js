const { createClient } = require("redis");

const checkCacheStations = async (req, res, next) => {
  try {
    const { community, region } = req.body;

    // Create a Redis client
    const client = createClient();

    // Handle errors
    client.on("error", (err) => console.log("Redis Client Error", err));

    // Use await to wait for the client to be ready
    await client.connect();

    let userSession = await client.get(community + region);
    if (userSession) {
      userSession = JSON.parse(userSession);
      return res.status(200).json({ stations: userSession });
    }
    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({ success: false });
  }
};

const checkCacheAuto = async (req, res, next) => {
  try {
    const { techNumber } = req.body;

    // Create a Redis client
    const client = createClient();

    // Handle errors
    client.on("error", (err) => console.log("Redis Client Error", err));

    // Use await to wait for the client to be ready
    await client.connect();

    let carData = await client.get(techNumber);
    if (carData) {
      carData = JSON.parse(carData);
      return res.status(200).json({ success: true, carData  });
    }
    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({ success: false });
  }
};

module.exports = {
  checkCacheStations,
  checkCacheAuto,
};
