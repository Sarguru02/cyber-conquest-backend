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
    const {batchNo , teamName} = req.body;
    const dice1 = Math.ceil(Math.random())*6;
    const dice2 = Math.ceil(Math.random())*6;

    await updateDoc(doc(db, batchNo, teamName), {
        position: dice1+dice2,
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
    console.log(req.session)
})


app.post("/addTeam",async (req,res)=>{
    const participant = req.body;
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

app.listen(3000, ()=>{
    console.log(`Server running on port 3000`);
})