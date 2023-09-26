const { setDoc, doc } = require("firebase/firestore");
const fs = require("fs");
const { db } = require("./firebase");

module.exports = async (req, res) => {
  var fname = "Panchathanthiram";
  fs.readFile(`./jsonData/${fname}.json`, "utf8", async (err, jsonString) => {
    if (err) {
      return res.status(500).send("Hello mf");
    }
    const qns = JSON.parse(jsonString);
    await setDoc(doc(db, "quiz", qns[0].quizTitle), { qns });
    return res.status(200).send(`${fname} Document is set`);
  });
};
