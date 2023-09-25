const { setDoc, doc } = require("firebase/firestore");
const fs = require("fs");
const { db } = require("../firebase");
module.exports = async (req, res, next) => {
  fs.readFile("./jsonData/properties.json", "utf-8", async (e, op) => {
    if (e) {
      console.log("Error happens");
      next();
    }
    const a = JSON.parse(op);
    await setDoc(
      doc(db, "gameProperties", `propertyDocument_${req.body.batchNo}`),
      {
        propertyArray: a,
      }
    );
  });
  next();
};
