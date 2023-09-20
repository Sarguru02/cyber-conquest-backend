const { setDoc, doc } = require("firebase/firestore");
const { db } = require("../firebase");

const jail = async (currentParticipant) => {
  await setDoc(
    doc(db, currentParticipant.batchNo.toString(), currentParticipant.teamName),
    { ...currentParticipant, inJail: true, position: 16 }
  );
};

const cryptoLocker = async (currentParticipant, pos) => {
  if (currentParticipant.propertiesOwned) {
    const props = currentParticipant.propertiesOwned.slice(
      0,
      Math.floor(currentParticipant.propertiesOwned.length / 2)
    );
    await setDoc(
      doc(
        db,
        currentParticipant.batchNo.toString(),
        currentParticipant.teamName
      ),
      { ...currentParticipant, propertiesOwned: props, position: pos }
    );
    console.log(props);
    return {
      message:
        "You are under cyber attack. Half of your properties are removed!",
    };
  } else {
    await setDoc(
      doc(
        db,
        currentParticipant.batchNo.toString(),
        currentParticipant.teamName
      ),
      { ...currentParticipant, position: pos }
    );
  }
};

module.exports = { jail, cryptoLocker };
