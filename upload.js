const { setDoc, doc } = require("firebase/firestore");
const fs = require("fs");
const { db } = require("./firebase");

module.exports = async (req, res) => {
  var fname = "properties";
  const bno = 9;
  fs.readFile(`./jsonData/${fname}.json`, "utf8", async (err, jsonString) => {
    if (err) {
      return res.status(500).send("Hello mf");
    }
    const qns = JSON.parse(jsonString);
    await setDoc(doc(db, "gameProperties", `propertyDocument_${bno}`), {
      propertyArray: qns,
    });
    return res.status(200).send(`${fname} Document is set`);
  });
};
