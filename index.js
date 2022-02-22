//Libraries
const express = require("express");
const axios = require("axios");
const path = require("path");

// Settings
const app = express();
PORT = 3000;
app.listen(PORT);

//View Engine
app.set("view engine", "ejs");

//Folder Path
app.use(express.static(__dirname + '/public'));

//Local Variable for teams.json file
app.locals.teamData = require("./json_data/teams.json");

//Home Page
app.get("/", (req, res) => {
  res.render("home");
});

//Team Page
app.get("/teams/:teamName", (req, res) => {
  const { teamName } = req.params;
  let team = require("./json_data/" + teamName + ".json");
  let teamHeader = (teamName.replace("_", " ")).toUpperCase();
  res.render("teamPage", { team, teamHeader});
});