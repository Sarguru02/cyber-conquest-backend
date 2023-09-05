require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getDoc, collection, getDocs, updateDoc, doc } = require("firebase/firestore");
const { db } = require("./firebase");
const session = require("express-session");
const cookieParser = require("cookie-parser")

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
    req.session.save();
    console.log("session from participants route", req.session)
    res.send(output)
})

app.post("/rollDice", async (req, res)=>{
    console.log(req.session)
    const {batchNo , teamName} = req.body;
    const dice1 = Math.ceil(Math.random())*6;
    const dice2 = Math.ceil(Math.random())*6;

    await updateDoc(doc(db, batchNo, teamName), {
        position: dice1+dice2,
    })
    return {dice1, dice2, position: dice1+dice2}
})


app.post("/current", (req,res)=>{
    const {batchNo} = req.body;
    console.log("session from current route: ", req.session);
    if(batchNo === req.session.batchNo){
        res.send(req.session.participants[(req.session.idx+1)%req.session.participants.length])
    } 
})

app.listen(3000, ()=>{
    console.log(`Server running on port 3000`);
})