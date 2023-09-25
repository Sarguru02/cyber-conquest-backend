const { setDoc, doc } = require("firebase/firestore");
const { db } = require("../firebase");

module.exports = async (req, res) => {
  const { currentParticipant, points } = req.body;
  await setDoc(
    doc(db, currentParticipant.batchNo.toString(), currentParticipant.teamName),
    {
      ...currentParticipant,
      position: parseInt(currentParticipant.position),
      points: parseInt(points),
    }
  );
  res.json("Points updated");
};
