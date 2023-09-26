const { setDoc, doc } = require("firebase/firestore");
const { db } = require("../firebase");
const { chance, communityChest } = require("./chance_community");
const { jail, cryptoLocker, kronos, incomeTax } = require("./corners");

module.exports = async (req, res) => {
  const { batchNo, player } = req.body;
  if (player.inJail === "true") {
    await setDoc(doc(db, player.batchNo.toString(), player.teamName), {
      ...player,
      position: 16,
      inJail: "false",
    });
    return res.json({
      dice1: 0,
      dice2: 0,
      position: 16,
      message: "Player does not have internet connection ☹️",
    });
  }
  const dice1 = Math.ceil(Math.random() * 6);
  const dice2 = Math.ceil(Math.random() * 6);
  // const dice1 = 2;
  // const dice2 = 3;
  // const pos = parseInt(player.position) + parseInt(dice1) + parseInt(dice2);
  const pos = 27;
  if (pos >= 32) {
    //----------------------------------------------------------
    //Edge case to increase amount after rounds
    //-----------------------------------------------------------
    player.rounds = parseInt(player.rounds) + 1;
    player.position = pos % 32;
    player.balance = parseInt(player.balance) + 200;
    await setDoc(doc(db, batchNo.toString(), player.teamName), player);
    return res.json({
      dice1,
      dice2,
      position: pos % 32,
      balance: player.balance,
    });
  } else if (pos % 32 === 11 || pos % 32 === 25) {
    //----------------------------------------------------------
    //Chance logic
    //-----------------------------------------------------------
    const obj = await chance(player, pos % 32);
    return res.json({ ...obj, dice1, dice2, position: pos % 32 });
  } else if (pos % 32 === 2 || pos % 32 === 20) {
    //----------------------------------------------------------
    //Community chest logic
    //-----------------------------------------------------------
    const obj = await communityChest(player, pos % 32);
    console.log(obj);
    return res.json({ ...obj, dice1, dice2, position: pos % 32 });
  } else if (pos % 32 === 16) {
    //----------------------------------------------------------
    //Jail - No wifi connection
    //-----------------------------------------------------------
    const objt = await jail(player);
    return res.json({
      ...objt,
      dice1,
      dice2,
      position: pos % 32,
      balance: player.balance,
    });
  } else if (pos % 32 === 8) {
    //----------------------------------------------------------
    //Crypto Locker
    //-----------------------------------------------------------
    const obj1 = await cryptoLocker(player, pos % 32);
    return res.json({
      ...obj1,
      dice1,
      dice2,
      position: pos % 32,
      balance: player.balance,
    });
  } else if (pos % 32 === 24) {
    //----------------------------------------------------------
    //Kronos
    //-----------------------------------------------------------
    const obj2 = await kronos(player, pos % 32);
    return res.json({ ...obj2, dice1, dice2, position: pos % 32 });
  } else if (pos % 32 === 4) {
    //----------------------------------------------------------
    //Income Tax
    //-----------------------------------------------------------
    const obj3 = await incomeTax(player, pos % 32);
    return res.json({ ...obj3, dice1, dice2, position: pos % 32 });
  } else {
    //----------------------------------------------------------
    //Other places
    //-----------------------------------------------------------
    player.position = pos % 32;
    await setDoc(doc(db, batchNo.toString(), player.teamName), player);
    return res.json({
      dice1,
      dice2,
      position: pos % 32,
      balance: player.balance,
    });
  }
};
