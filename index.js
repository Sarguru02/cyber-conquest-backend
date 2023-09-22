require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  getDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
} = require("firebase/firestore");
const { db } = require("./firebase");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { generateNewColor } = require("./utils/genColor");
const { chance, communityChest } = require("./utils/chance_community");
const {
  jail,
  cryptoLocker,
  cornerOfConfusion,
  incomeTax,
} = require("./utils/corners");
const fs = require("fs");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    secret: process.env.SESSION_SECRET,
  })
);

app.get("/", (req, res) => {
  res.send("Everything okay");
});

app.post("/participants", async (req, res) => {
  const { batchNo } = req.body;
  if (batchNo) {
    const participants = await getDocs(collection(db, batchNo));
    const output = [];
    participants.forEach((doc) => {
      const data = doc.data();
      output.push(data);
    });
    req.session.batchNo = batchNo;
    req.session.participants = output;
    req.session.idx = 0;
    res.send(output);
  }
});

app.post("/rollDice", async (req, res) => {
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
  //   const dice1 = 2;
  //   const dice2 = 6;
  const pos = parseInt(player.position) + parseInt(dice1) + parseInt(dice2);
  if (pos >= 32) {
    player.rounds = parseInt(player.rounds) + 1;
    player.position = pos % 32;
    player.balance = parseInt(player.balance) + 200;
    await setDoc(doc(db, batchNo.toString(), player.teamName), player);
  } else if (pos % 32 === 11 || pos % 32 === 25) {
    //----------------------------------------------------------
    //Chance logic
    //-----------------------------------------------------------
    const obj = chance(player, pos % 32);
    return res.json({ ...obj, dice1, dice2, position: pos % 32 });
  } else if (pos % 32 === 2 || pos % 32 === 20) {
    //----------------------------------------------------------
    //Community chest logic
    //-----------------------------------------------------------
    const obj = communityChest(player, pos % 32);
    return res.json({ ...obj, dice1, dice2, position: pos % 32 });
  } else if (pos % 32 === 16) {
    jail(player);
    return res.json({ dice1, dice2, position: pos % 32 });
  } else if (pos % 32 === 8) {
    const obj1 = cryptoLocker(player, pos % 32);
    return res.json({ ...obj1, dice1, dice2, position: pos % 32 });
  } else if (pos % 32 === 24) {
    const obj2 = cornerOfConfusion(player, pos % 32);
    return res.json({ ...obj2, dice1, dice2, position: pos % 32 });
  } else if (pos % 32 === 4) {
    const obj3 = incomeTax(player, pos % 32);
    return res.json({ ...obj3, dice1, dice2, position: pos % 32 });
  } else {
    player.position = pos % 32;
    await setDoc(doc(db, batchNo.toString(), player.teamName), player);
    return res.json({ dice1, dice2, position: pos % 32 });
  }
});

app.post("/current", (req, res) => {
  const { batchNo } = req.body;
  if (batchNo === req.session.batchNo) {
    const idx = req.session.idx;
    req.session.idx = (req.session.idx + 1) % req.session.participants.length;
    res.send(req.session.participants[idx]);
  }
});

app.post("/addTeam", async (req, res) => {
  let participant = req.body.participant;
  const colName = participant.batchNo.toString();
  participant = {
    ...participant,
    color: generateNewColor(),
    position: 0,
    balance: 500,
    points: 0,
    propertiesOwned: [],
    rounds: 0,
    inJail: "false",
  };
  await setDoc(doc(db, colName, participant.teamName), participant);
  res.send("Team Added");
});

app.post("/buy", async (req, res) => {
  const { currentParticipant, price, propertyInfo } = req.body;
  currentParticipant.propertiesOwned.push({
    propertyName: propertyInfo.propertyName,
    propertyCategory: propertyInfo.category,
    propertyValue: parseInt(price),
  });
  await setDoc(
    doc(db, currentParticipant.batchNo.toString(), currentParticipant.teamName),
    {
      ...currentParticipant,
      balance: parseInt(currentParticipant.balance) - parseInt(price),
      propertiesOwned: currentParticipant.propertiesOwned,
    }
  );
  req.session.properties = [
    ...req.session.properties.filter((baka) => parseInt(baka.position) !== 5),
    { ...propertyInfo, owner: currentParticipant.teamName },
  ];
  await setDoc(doc(db, "gameProperties", "propertyDocument"), {
    propertyArray: req.session.properties,
  });
  res.status(200).send("Hello mf");
});

app.post("/reset", async (req, res) => {
  const batchNo = req.body.batchNo;
  const ref = await getDocs(collection(db, batchNo));
  const participants = [];
  ref.forEach((d) => {
    const data = d.data();
    setDoc(doc(db, batchNo, data.teamName), {
      ...data,
      position: 0,
      rounds: 0,
      points: 0,
      balance: 500,
      inJail: "false",
      propertiesOwned: [
        {
          propertyName: "something",
          propertyValue: "2000",
          propertyCategory: "something",
        },
        {
          propertyName: "nothing",
          propertyValue: "2000",
          propertyCategory: "nothing",
        },
      ],
    }).then(() => console.log("completed"));
  });
  res.send("Hello");
});

app.get("/properties", async (req, res) => {
  getDoc(doc(db, "gameProperties", "propertyDocument")).then((d) => {
    if (d.exists()) {
      req.session.properties = d.data().propertyArray;
      return res.status(200).send("Properties got 👍 ");
    } else {
      return res.status(401).json({ message: "Properties does not exist" });
    }
  });
});
app.post("/getProp", async (req, res) => {
  const position = parseInt(req.body.position);
  const propertyAtPosition = req.session.properties.filter((property) => {
    if (parseInt(property.position) === position) {
      return property;
    }
  });
  return res.status(200).json({ property: propertyAtPosition[0] });
});

app.post("/updatePoints", async (req, res) => {
  const { currentParticipant, points } = req.body;
  await setDoc(
    doc(db, currentParticipant.batchNo.toString(), currentParticipant.teamName),
    { ...currentParticipant, points: parseInt(points) }
  );
  res.json("Points updated");
});

app.get("/hello", async (req, res) => {
  fs.readFile("./windows.json", "utf8", async (err, jsonString) => {
    if (err) {
      return res.status(500).send("Hello mf");
    }
    const qns = JSON.parse(jsonString);
    await setDoc(doc(db, "quiz", qns[0].quizTitle), { qns });
    return res.status(200).send("Document is set");
  });
});

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
