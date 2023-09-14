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
       output.push(doc.data()) 
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
    const pos = (parseInt(player.position)+parseInt(dice1)+parseInt(dice2)) % 32


    await updateDoc(doc(db, batchNo, player.teamName), {
        position: pos 
    })
    res.send({dice1, dice2, position: dice1+dice2})
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
        propertiesOwned: []
    }
    await setDoc(doc(db, colName, participant.teamName), participant)
    res.send("Team Added")
})


// app.post("/buy", async (req,res)=>{
    
// })


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

app.listen(3000, ()=>{
    console.log(`Server running on port 3000`);
})