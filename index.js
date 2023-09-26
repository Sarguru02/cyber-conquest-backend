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
const { jail, cryptoLocker, incomeTax, kronos } = require("./utils/corners");
const fs = require("fs");
const rollDice = require("./utils/rollDice");
const updatePoints = require("./utils/updatePoints");
const upload = require("./upload");
const setDocument = require("./utils/setDocument");

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

app.post("/rollDice", rollDice);

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
  if (parseInt(currentParticipant.balance < propertyInfo.price)) {
    return res.json({ message: "Bro does not have enough money to buy it" });
  }
  if (currentParticipant.propertiesOwned) {
    currentParticipant.propertiesOwned.push({
      propertyName: propertyInfo.propertyName,
      propertyCategory: propertyInfo.category,
      propertyValue: parseInt(price),
    });
  } else {
    const propertiesOwned = [
      {
        propertyName: propertyInfo.propertyName,
        propertyCategory: propertyInfo.category,
        propertyValue: price,
      },
    ];
    await setDoc(
      doc(
        db,
        currentParticipant.batchNo.toString(),
        currentParticipant.teamName
      ),
      {
        ...currentParticipant,
        position: parseInt(currentParticipant.position),
        balance: parseInt(currentParticipant.balance) - parseInt(price),
        propertiesOwned,
      }
    );
  }
  const reqProps = await getDoc(
    doc(db, "gameProperties", `propertyDocument_${currentParticipant.batchNo}`)
  );
  req.session.properties = [
    ...req.session.properties.filter(
      (baka) => parseInt(baka.position) !== parseInt(propertyInfo.position)
    ),
    {
      ...propertyInfo,
      owner: currentParticipant.teamName,
      position: parseInt(propertyInfo.position),
    },
  ];
  await setDoc(
    doc(db, "gameProperties", `propertyDocument_${currentParticipant.batchNo}`),
    {
      propertyArray: req.session.properties,
    }
  );
  res.status(200).send("Hello mf");
});

app.post("/reset", async (req, res) => {
  const batchNo = req.body.batchNo;
  const ref = await getDocs(collection(db, batchNo));
  ref.forEach((d) => {
    const data = d.data();
    setDoc(doc(db, batchNo, data.teamName), {
      ...data,
      position: 0,
      rounds: 0,
      points: 0,
      balance: 500,
      inJail: "false",
      propertiesOwned: [],
    }).then(() => console.log("completed"));
  });
  fs.readFile("./jsonData/properties.json", "utf-8", async (err, op) => {
    if (err) {
      res.send("Hello");
    }
    await setDoc(doc(db, "gameProperties", `propertyDocument_${batchNo}`), {
      propertyArray: JSON.parse(op),
    });
  });

  res.status(200).send("Everything Reset properly");
});

app.post("/properties", async (req, res) => {
  const { batchNo } = req.body;
  getDoc(doc(db, "gameProperties", `propertyDocument_${batchNo}`)).then((d) => {
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

app.post("/updatePoints", updatePoints);

app.get("/hello", upload);

app.post("/rent", async (req, res) => {
  const { property, player } = req.body;
  const ownerRef = await getDoc(
    doc(db, player.batchNo.toString(), property.owner)
  );
  if (ownerRef.exists()) {
    const owner = ownerRef.data();
    if (parseInt(player.balance) - parseInt(owner.balance)) {
      await setDoc(doc(db, owner.batchNo.toString(), owner.teamName), {
        ...owner,
        position: owner.position,
        balance: parseInt(owner.balance) + parseInt(property.price) * 0.5,
      });
      await setDoc(doc(db, player.batchNo.toString(), player.teamName), {
        ...player,
        position: parseInt(player.position),
        balance: parseInt(player.balance) - parseInt(property.price) * 0.5,
      });
      return res.send("Rent paid successfully");
    } else {
      return res.json({
        message: "Bro does not have enough money to pay rent it seems!",
      });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Owner is not found! Don't waste money bro !" });
  }
});

app.post("/quiz", async (req, res) => {
  const { property } = req.body;
  const docRef = await getDoc(doc(db, "quiz", property.quizName));
  if (docRef.exists()) {
    const qns = docRef.data().qns;
    const idx = Math.floor(Math.random() * qns.length);
    return res.json({ qzObj: qns[idx] });
  }
  return res.send("OK");
});

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
