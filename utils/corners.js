const { setDoc, doc, getDoc } = require("firebase/firestore");
const { db } = require("../firebase");

const jail = async (currentParticipant) => {
  currentParticipant = { ...currentParticipant, inJail: true, position: 16 };
  await setDoc(
    doc(db, currentParticipant.batchNo.toString(), currentParticipant.teamName),
    currentParticipant
  );
  return {
    message: "You don't have network connection! Your next turn is loading!",
    balance: currentParticipant.balance,
  };
};

const cryptoLocker = async (currentParticipant, pos) => {
  if (currentParticipant.propertiesOwned) {
    const idx = Math.floor(currentParticipant.propertiesOwned.length / 2);
    const props = currentParticipant.propertiesOwned.slice(0, idx);
    const others = currentParticipant.propertiesOwned.slice(idx);
    const a = await getDoc(
      doc(
        db,
        "gameProperties",
        `propertyDocument_${currentParticipant.batchNo}`
      )
    );
    let b;
    if (a.exists()) {
      b = a.data().propertyArray;
      for (let i = 0; i < b.length; i++) {
        for (let j = 0; j < others.length; j++) {
          if (b[i].propertyName === others[j].propertyName) {
            b[i].owner = "";
          }
        }
      }
      currentParticipant = {
        ...currentParticipant,
        propertiesOwned: props,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        currentParticipant
      );
      await setDoc(
        doc(
          db,
          "gameProperties",
          `propertyDocument_${currentParticipant.batchNo}`
        ),
        {
          propertyArray: b,
        }
      );
    } else {
      console.log("Property array is not found in firebase");
    }

    return {
      message:
        "You are under cyber attack. Half of your properties are taken away!",
      balance: currentParticipant.balance,
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
    return {
      message: "Escaped! You don't have any Properties left! ",
      balance: currentParticipant.balance,
    };
  }
};

const kronos = async (currentParticipant, pos) => {
  await setDoc(
    doc(db, currentParticipant.batchNo.toString(), currentParticipant.teamName),
    {
      ...currentParticipant,
      position: pos,
      balance: parseInt(currentParticipant.balance) * 0.9,
    }
  );
  return {
    message: "Hahaha! I may be old, but stole ur 10% gold 💀",
    balance: parseInt(currentParticipant.balance) * 0.9,
  };
};

const incomeTax = async (currentParticipant, pos) => {
  await setDoc(
    doc(db, currentParticipant.batchNo.toString(), currentParticipant.teamName),
    {
      ...currentParticipant,
      position: pos,
      balance: parseInt(currentParticipant.balance) * 0.8,
    }
  );
  return {
    message: "Pay 20% as an Income Tax ",
    balance: parseInt(currentParticipant.balance) * 0.8,
  };
};

module.exports = { jail, cryptoLocker, kronos, incomeTax };
