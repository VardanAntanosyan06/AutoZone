const { createClient } = require("redis");

module.exports = function () {
  return async function (req, res, next) {
    try {
        const { community, region } = req.body;

        const client = await createClient()
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();

        let userSession = await client.get(community+region);
        if(userSession){
            userSession = JSON.parse(userSession)
            return res.status(200).json({stations:userSession})
        }
      next();
    } catch (e) {
        console.log(e);
    return res.status(401).json({ success: false });
    }
  };
};
