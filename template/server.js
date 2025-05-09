
// Required imports
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Default CORS configuration for development
app.use(cors());

// Using body-parser -> can access req.body directly
app.use(bodyParser.json());

// Update PORT in the .env file, according to your requirements
const PORT = process.env.PORT || 5000;

// default route
app.get("/", (res) => {
    res.send("Express server has been setup for Vercel!");
})

// listen function for if not deployed to vercel. If deployed to -> Render, Heroku, etc
app.listen(PORT, () => {
    console.log("Server started on port: " + PORT);
})

// exporting app for Vercel
module.exports = app;