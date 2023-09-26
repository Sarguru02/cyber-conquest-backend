const { setDoc, doc, getDoc } = require("firebase/firestore");
const fs = require("fs");
const { db } = require("../firebase");
module.exports = async (req, res, next) => {
  try {
    const abc = await getDoc(
      doc(db, "gameProperties", `propertyDocument_${req.body.batchNo}`)
    );
    if (abc.exists()) {
      if (!abc.data()) {
        throw "Mf";
      }
      next();
    } else {
      throw new error("Property is not set");
    }
  } catch (errrrr) {
    console.log("hit", errrrr.message);
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
  }
};
