const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");


const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/ty22");


// app.post('/register',(req,res)=>{
//     User.create(req.body)
//     .then(user=>res.json(user))
//     .catch(err => res.json(err))

// })

app.use("/api", require("./routes/auth"));
app.listen(3001, () => console.log("serveur is running"));
