const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
 app.use(cors({
    origin: "http://localhost:5000",
    credentials: true
 }));

 app.use(express.json());
 app.use(cookieParser());

 app.get("/", (req, res) => {
    res.send("API is Running");
 });

 module.exports = app;