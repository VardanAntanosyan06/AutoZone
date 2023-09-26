const fetch = require("node-fetch");
const {calculateDistance} = require("./lib")

const GetStatons = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    let stations = await fetch("https://api.onepay.am/autoclub/partners", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          "Y3rFG3iEZUVhbn7v6sJOzovrkZkvIZHYb9Kb7LnYqCW0Ne5pVsqPt3NdLvGiDQPp",
      },
    });
    stations = await stations.json();

    stations = stations.map((e)=>{
    e.data = e.translations.hy
    e.location.name = e.location.translations.hy.name;
    e.location.parent = e.location.parent.translations.hy.name
    delete e.translations
    delete e.location.translations
    delete e.location.parent.translations
    
      return e
    })
    const stationsWithDistances = stations.map((station) => {

      const distance = calculateDistance(latitude, longitude,station.latitude,station.longitude);
      return { ...station, distance };
    });

    stationsWithDistances.sort((a, b) => a.distance - b.distance);
    
    return res.status(200).json({ stationsWithDistances });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  GetStatons,
};
