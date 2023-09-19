require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getDoc, collection, getDocs, updateDoc, doc, setDoc } = require("firebase/firestore");
const { db } = require("./firebase");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { generateNewColor } = require("./utils/genColor");

const app = express();

app.use(bodyParser.urlencoded({extended: true}))
app.use(cors({
    origin: true, 
    credentials: true
}))
app.use(cookieParser())
app.use(session({
    resave: false, 
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60 * 24},
    secret: process.env.SESSION_SECRET

}))

app.get("/", (req, res)=>{
    res.send("Everything okay");
})


app.post("/participants", async (req,res)=>{
    const {batchNo} = req.body;
    const participants = await getDocs(collection(db, batchNo));
    const output = []
    participants.forEach(doc => {
        const data = doc.data();
       output.push(
       data) 
    });
    req.session.batchNo = batchNo;
    req.session.participants = output;
    req.session.idx = 0;
    res.send(output)
})

app.post("/rollDice", async (req, res)=>{
    const {batchNo , player} = req.body;
    const dice1 = Math.ceil(Math.random()*6);
    const dice2 = Math.ceil(Math.random()*6);
    const pos = (parseInt(player.position)+parseInt(dice1)+parseInt(dice2)) 
    if(pos >=32){
        player.rounds = parseInt(player.rounds) +1;
        player.position = pos % 32;
        player.balance = parseInt(playe.balance)+200;
        await setDoc(doc(db, batchNo.toString(), player.teamName), player);
    } else if(pos === 8){

    }
    
    else {
        player.position = pos%32;
        await setDoc(doc(db, batchNo.toString(), player.teamName),player)
    }


    res.send({dice1, dice2, position: pos%32})
})


app.post("/current", (req,res)=>{
    const {batchNo} = req.body;
    if(batchNo === req.session.batchNo){
        const idx = req.session.idx;
        req.session.idx = (req.session.idx +1) % req.session.participants.length;
        res.send(req.session.participants[idx]);
    } 
})


app.post("/addTeam",async (req,res)=>{
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
        inJail: false,
    }
    await setDoc(doc(db, colName, participant.teamName), participant)
    res.send("Team Added")
})


// app.post("/buy", async (req,res)=>{
    
// })


app.post("/reset",async (req,res)=>{
    const batchNo = req.body.batchNo;
    const ref = await getDocs(collection(db, batchNo));
    const participants = [];
    ref.forEach(d=>{
        const data= d.data()
       setDoc(doc(db, batchNo, data.teamName),{...data, position: 0, rounds: 0, points: 0, balance: 500, inJail: false} ).then(()=> console.log("completed")); 
    })
    res.send("Hello")
})

app.post("/money", async (req,res)=>{
    const {batchNo, teamName, money, change} = req.body;
    const a = await getDoc(doc(db, batchNo.toString(), teamName));
    if(a.exists()){
        let data = a.data();
        if(change === "add"){
            data = {...data, balance: data.balance+money}
            await setDoc(doc(db, batchNo, teamName), data)
            return res.json(data)
        } else if(change=== "sub"){
            data = {...data, balance: data.balance - money}
        }
    } else {
        return res.status(401).json("Participant not found")
    }

})

app.post("/updatePoints", async (req,res)=>{
    const {currentParticipant, points} = req.body;
    currentParticipant.points = parseInt(points);
    await setDoc(doc(db, currentParticipant.batchNo.toString(), currentParticipant.teamName), currentParticipant)
    res.json("Points updated")
})

app.listen(3000, ()=>{
    console.log(`Server running on port 3000`);
})