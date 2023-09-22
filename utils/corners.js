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

const cornerOfConfusion = async (currentParticipant, pos) => {
  await setDoc(
    doc(db, currentParticipant.batchNo.toString(), currentParticipant.teamName),
    {
      ...currentParticipant,
      position: pos,
      balance: parseInt(currentParticipant.balance) * 0.9,
    }
  );
  return { message: "Hahaha! I may be old, but stole ur 10% gold 💀" };
};

const incomeTax = async (currentParticipant, pos) => {
  await setDoc(
    doc(db, currentParticipant.batchNo.toString(), currentParticipant.teamName),
    {
      ...currentParticipant,
      position: pos,
      balance: parseInt(currentParticipant.balance) * 0.65,
    }
  );
  return { message: "Pay 35% as an Income Tax " };
};

module.exports = { jail, cryptoLocker, cornerOfConfusion, incomeTax };
