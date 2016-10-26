var tmi = require("tmi.js"),
    config = require("./config"),
    db = require("./db")
    tmiOptions = {
      options: {
          debug: true
      },
      connection: {
          cluster: "aws",
          reconnect: true
      },
      identity: {
          username: "Heepsbot",
          password: config.twitch.bot
      },
      channels: ["#heep123", "#heepsbot"]
    },
    twitchBot = new tmi.client(tmiOptions);

twitchBot.connect();

twitchBot.on("connected", function (address, port) {
  console.log("[TWITCH] Login Successful!")
  joinAllChannels();
});

function joinAllChannels() {
  db.twitch_settings.getAll().then(function(result) {
    for (var i in result) {
      twitchBot.join(result[i]);
    }
  });
}

module.exports = {

};
