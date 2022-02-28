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
app.use(express.static(__dirname + "/public"));

//Home Page
app.get("/", (req, res) => {
  const getAllTeams = async () => {
    try {
      let response = await axios.get(
        `https://maqhspyw3j.execute-api.us-east-1.amazonaws.com/dev/teams.json`
      );
      teamData = response.data;
      res.render("home", { teamData });
    } catch (error) {
      console.error(error);
    }
  };

  getAllTeams();
});

//Team Page
app.get("/teams/:teamName", (req, res) => {
  const { teamName } = req.params;
  let team;

  const getTeam = async () => {
    try {
      let response = await axios.get(
        `https://maqhspyw3j.execute-api.us-east-1.amazonaws.com/dev/${teamName}.json`
      );
      team = response.data;
      res.render("teamPage", { team });
    } catch (error) {
      console.error(error);
    }
  };

  getTeam();
});
