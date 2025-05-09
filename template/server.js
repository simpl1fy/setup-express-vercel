const express = require("express");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Express server has been setup for Vercel!")
})

app.listen(PORT, () => {
    console.log("Server started on port: " + PORT);
})

module.exports = app;