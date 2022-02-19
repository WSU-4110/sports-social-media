const express = require("express");
const app = express();
const axios = require("axios");

PORT = 3000;
app.listen(PORT);


app.set("view engine", "ejs");

app.use(express.static('public'));  

app.locals.teamData = require("./json_data/teams.json");
app.get("/", (req, res) => {

    res.render("home");
});

app.get("/teams/:teamid", (req, res) => {
  // "/teams/{teamid}" redirects to teamPage.ejs
  // this page is dynamically created each time and populated with the player names from the below api call
  const { teamid } = req.params;
  //teamid parameter is being pulled from the address bar, stored as a variable,
  //and then injected into the the call to the espn API below

  const getRosterData = async () => {
    try {
      return await axios.get(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamid}/roster`
      );
    } catch (error) {
      console.error(error);
    }
  };

  const renderRosterData = async () => {
    const returnedTeamData = await getRosterData();

    if (returnedTeamData.data) {
      players = returnedTeamData.data.athletes;
      teamName = returnedTeamData.data.team.displayName;
    }

    res.render("teamPage", { players: players, teamName: teamName });
    // "players" and "teamName" are being sent in an object to the dynamically created teamPage.ejs file
    // These variables can be used to utilize the team name and loop over the player names
    // We can extract anything else needed from returnedTeamData as well, such as number, position, etc.
  };

  renderRosterData();
});
